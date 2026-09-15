from __future__ import annotations
import re
from typing import List, Optional, Tuple
from .models import OCRLine
from .normalize import MULT_SIGNS

UNITS = {
    "strip":"strip","strips":"strip","stp":"strip",
    "box":"box","boxes":"box","bx":"box",
    "piece":"piece","pieces":"piece","pc":"piece","pcs":"piece",
    "bottle":"bottle","bottles":"bottle","btl":"bottle",
    "sachet":"sachet","sachets":"sachet",
    "tube":"tube","tubes":"tube",
    "pack":"pack","packs":"pack","pkt":"pack",
    "vial":"vial","vials":"vial",
}
URGENCY_TERMS = {
    "URGENT": ["urgent","urgnt","stat","immediate","asap","jaldi","priority","today"],
    "ROUTINE": ["routine","normal","regular"],
}

_STRENGTH = re.compile(r"\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|gm|ml|iu|%)\b", re.I)
_ORDER_UNIT_PATTERN = r"strip|strips|stp|box|boxes|bx|piece|pieces|pc|pcs|bottle|bottles|btl|sachet|sachets|tube|tubes|pack|packs|pkt|vial|vials"
_QTY_X = re.compile(rf"(?:^|\s)[{re.escape(MULT_SIGNS)}]\s*(\d+(?:\.\d+)?)(?:\s*({_ORDER_UNIT_PATTERN})\b)?", re.I)
_QTY_X_SUFFIX = re.compile(rf"\b(\d+(?:\.\d+)?)\s*[{re.escape(MULT_SIGNS)}](?:\s*({_ORDER_UNIT_PATTERN})\b)?", re.I)
_QTY_PREFIX = re.compile(r"\b(?:qty|quantity)\s*[:=\-]?\s*(\d+(?:\.\d+)?)\b", re.I)
_QTY_UNIT = re.compile(r"\b(\d+(?:\.\d+)?)\s*(strip|strips|stp|box|boxes|bx|piece|pieces|pc|pcs|bottle|bottles|btl|sachet|sachets|tube|tubes|pack|packs|pkt|vial|vials)\b", re.I)
_GAUGE = re.compile(r"\b(\d{1,2})\s*[gG]\b")
_PRICE = re.compile(r"(?:₹|rs\.?|inr)\s*\d+(?:\.\d+)?", re.I)

NUMBER_WORDS = {
    'one':1,'two':2,'three':3,'four':4,'five':5,'six':6,'seven':7,'eight':8,'nine':9,'ten':10,
    'eleven':11,'twelve':12,'thirteen':13,'fourteen':14,'fifteen':15,'sixteen':16,'seventeen':17,
    'eighteen':18,'nineteen':19,'twenty':20,'twenty-five':25,'thirty':30,'forty':40,'fifty':50,
}

def _num_word(s: str) -> Optional[float]:
    return float(NUMBER_WORDS[s.lower()]) if s.lower() in NUMBER_WORDS else None

def normalize_urgency(text: str, explicit: Optional[str] = None) -> str:
    if explicit:
        e = str(explicit).upper().strip()
        if e in {"URGENT","ROUTINE","NOT_SPECIFIED"}: return e
    low = re.sub(r"\s+", " ", (text or '').lower())
    for label, terms in URGENCY_TERMS.items():
        for term in terms:
            # IMPORTANT: token boundary prevents 'stat' from corrupting Statfree.
            if re.search(rf"(?<![a-z0-9]){re.escape(term)}(?![a-z0-9])", low):
                return label
    return "NOT_SPECIFIED"

def classify_number_roles(text: str) -> List[dict]:
    out=[]
    for m in _STRENGTH.finditer(text or ''):
        role = 'PACK_OR_VOLUME' if m.group(2).lower()=='ml' and not re.search(r'\b(?:dose|strength)\b', text or '', re.I) else 'STRENGTH_OR_VOLUME'
        out.append({'text':m.group(0),'role':role,'start':m.start(),'end':m.end()})
    for m in _GAUGE.finditer(text or ''):
        if re.search(r'needle|syringe|iv|cannula', text or '', re.I):
            out.append({'text':m.group(0),'role':'GAUGE','start':m.start(),'end':m.end()})
    for m in _PRICE.finditer(text or ''):
        out.append({'text':m.group(0),'role':'PRICE','start':m.start(),'end':m.end()})
    for rx in (_QTY_X,_QTY_X_SUFFIX,_QTY_PREFIX,_QTY_UNIT):
        for m in rx.finditer(text or ''):
            out.append({'text':m.group(0),'role':'QUANTITY','start':m.start(),'end':m.end()})
    out.sort(key=lambda x:(x['start'],x['end']))
    return out

def extract_quantity(text: str) -> Tuple[Optional[float], Optional[str], str]:
    raw=text or ''
    q=_QTY_X.search(raw)
    if q: return float(q.group(1)), (UNITS.get(q.group(2).lower()) if q.group(2) else None), 'EXPLICIT_MULTIPLIER'
    q=_QTY_X_SUFFIX.search(raw)
    if q: return float(q.group(1)), (UNITS.get(q.group(2).lower()) if q.group(2) else None), 'EXPLICIT_MULTIPLIER'
    q=_QTY_PREFIX.search(raw)
    if q: return float(q.group(1)), None, 'EXPLICIT_QTY_LABEL'
    q=_QTY_UNIT.search(raw)
    if q: return float(q.group(1)), UNITS.get(q.group(2).lower()), 'NUMBER_WITH_ORDER_UNIT'
    # Word + unit, but never treat bare numbers as quantity.
    uw='|'.join(sorted(map(re.escape,UNITS), key=len, reverse=True))
    m=re.search(rf"\b({'|'.join(map(re.escape,NUMBER_WORDS))})\s+({uw})\b", raw, re.I)
    if m:
        return _num_word(m.group(1)), UNITS.get(m.group(2).lower()), 'WORD_NUMBER_WITH_ORDER_UNIT'
    return None,None,'UNKNOWN'

def clean_name(raw: str) -> str:
    name=raw or ''
    # remove only whole urgency tokens; never substrings inside brands (Statfree bug).
    for terms in URGENCY_TERMS.values():
        for term in terms:
            name=re.sub(rf"(?<![A-Za-z0-9]){re.escape(term)}(?![A-Za-z0-9])", " ", name, flags=re.I)
    # Remove exactly one quantity expression path. Running every quantity regex in sequence can
    # corrupt a medicine discriminator: e.g. removing '×15' first from 'Dolo 650 ×15 strips'
    # and then interpreting the leftover '650 strips' as a quantity.
    name,nx=_QTY_X.subn(" ",name,count=1)
    if not nx:
        name,nx=_QTY_X_SUFFIX.subn(" ",name,count=1)
        if not nx:
            name,np=_QTY_PREFIX.subn(" ",name,count=1)
            if not np:
                name,_=_QTY_UNIT.subn(" ",name,count=1)
    name=re.sub(r"\b(?:qty|quantity)\b", " ", name, flags=re.I)
    name=re.sub(r"[|,;:=]+"," ",name)
    return re.sub(r"\s+"," ",name).strip(" -—")

def likely_operator_note(text: str) -> bool:
    low=(text or '').lower()
    # Keep this conservative: only obvious action/note phrases, not medicine names.
    note_markers=['dena hai','nahi dena','khali capsule','only capsule','do not order','cancel','mat dena','खाली कैप्सूल देना है','नहीं देना','मत देना']
    return any(x in low for x in note_markers)

def parse_free_text_line(text: str, engine='text', confidence=0.5, group_name=None) -> OCRLine:
    raw=(text or '').strip()
    quantity, unit, qrole=extract_quantity(raw)
    strength=None
    m=_STRENGTH.search(raw)
    if m: strength=f"{m.group(1)} {m.group(2).lower()}"
    name=clean_name(raw)
    return OCRLine(
        raw_text=raw, medicine_name=name, quantity=quantity, unit=unit, strength=strength,
        urgency=normalize_urgency(raw), source_engine=engine, ocr_confidence=float(confidence or 0),
        group_name=group_name, is_order_line=not likely_operator_note(raw),
        quantity_role=qrole, line_status='ACTIVE' if not likely_operator_note(raw) else 'NOTE',
    )

def parse_text_block(text: str, engine='text', confidence=0.5) -> List[OCRLine]:
    # Accept newline, semicolon and comma separated text lists.
    raw_segments=[]
    for line in (text or '').splitlines():
        raw_segments.extend([x.strip() for x in re.split(r"[;,]",line) if x.strip()])
    lines=[]; group=None
    for s in raw_segments:
        if s.endswith(':') and len(s)<=50:
            group=s[:-1].strip(); continue
        item=parse_free_text_line(s,engine,confidence,group)
        if item.medicine_name.lower() in {'brand','qty','quantity','medicine'}: continue
        if len(item.medicine_name)<2 and not item.raw_text: continue
        lines.append(item)
    return lines
