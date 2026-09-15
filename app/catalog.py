from __future__ import annotations
import csv, re, math
from dataclasses import dataclass
from typing import Optional, List
from .models import OCRLine, Resolution
from .normalize import norm_text, brand_root
from .lexicon import CatalogIndex, score_name
from .lasa import lasa_guard

@dataclass
class CatalogRow:
    master_product_id: str
    product_name: str
    price: Optional[float]
    is_discontinued: bool
    manufacturer: str
    type: str
    pack_size_label: str
    short_composition1: str
    short_composition2: str
    strength: str = ''
    form: str = ''
    aliases: str = ''

def _parse_bool(val: str) -> bool:
    v = str(val).strip().upper()
    if v in {'TRUE', '1', 'YES'}: return True
    return False

def load_catalog(path:str)->List[CatalogRow]:
    rows=[]
    with open(path,newline='',encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        fields = {k.strip().lower(): k for k in (reader.fieldnames or []) if k}
        def get(r: dict, keys: list[str]) -> str:
            for k in keys:
                if k in fields: return str(r.get(fields[k]) or '').strip()
            return ''

        for r in reader:
            mid = get(r, ['id', 'sku', 'master_product_id'])
            name = get(r, ['name', 'product_name', 'brand'])
            if mid and name:
                try: price = float(get(r, ['price', 'price(₹)', 'price_in_inr']))
                except: price = None
                is_disc = _parse_bool(get(r, ['is_discontinued']))
                manufacturer = get(r, ['manufacturer_name', 'manufacturer'])
                typ = get(r, ['type', 'form'])
                pack = get(r, ['pack_size_label', 'pack'])
                comp1 = get(r, ['short_composition1', 'composition1'])
                comp2 = get(r, ['short_composition2', 'composition2'])
                strength = get(r, ['strength'])
                aliases = get(r, ['aliases'])
                rows.append(CatalogRow(mid, name, price, is_disc, manufacturer, typ, pack, comp1, comp2, strength, typ, aliases))
    return rows

def _strength_tokens(s:str)->set[str]:
    return set(re.findall(r"\d+(?:\.\d+)?\s*(?:mg|mcg|g|gm|ml|iu|%)", norm_text(s)))

def _strength_score(query:str,row:CatalogRow)->tuple[float,bool]:
    q=_strength_tokens(query); r=_strength_tokens(f"{row.product_name} {row.strength}")
    if not q:return 0.55,False
    if not r:return 0.45,False
    if q & r:return 1.0,False
    return 0.0,True

def resolve(line:OCRLine,catalog:List[CatalogRow],correction_master_id:Optional[str]=None,index:CatalogIndex|None=None)->Resolution:
    if not line.is_order_line or line.line_status in {'CROSSED_OUT','NOTE'}:
        return Resolution('IGNORE',None,None,0.0,'not an active order line',[],False)
    q=(line.medicine_name or '').strip()
    if len(brand_root(q))<2:
        return Resolution('NO_MATCH',None,None,0.0,'insufficient medicine text',[],True)
    idx=index or CatalogIndex(catalog)
    candidates=idx.candidates(q)
    scored=[]
    for row in candidates:
        ns=max(score_name(q,row.product_name), score_name(q,f"{row.product_name} {row.aliases}"))
        ss,conflict=_strength_score(f"{line.medicine_name} {line.strength or ''}",row)
        total=0.88*ns+0.12*ss
        if correction_master_id and row.master_product_id==correction_master_id:
            total=min(1.0,total+0.08)
        # Apply a small penalty to discontinued items so active items rank higher
        if row.is_discontinued:
            total = max(0.0, total - 0.05)
        scored.append((total,ns,ss,conflict,row))
    scored.sort(key=lambda x:x[0],reverse=True)
    if not scored:
        return Resolution('NO_MATCH',None,None,0.0,'catalogue empty/no candidates',[],True)
    top=scored[0]; second=scored[1] if len(scored)>1 else (0,0,0,False,None)
    margin=top[0]-second[0]
    cand=[]
    for total,ns,ss,conflict,row in scored[:5]:
        cand.append({'master_product_id':row.master_product_id,'product_name':row.product_name,'strength':row.strength,'form':row.form,'manufacturer':row.manufacturer,'score':round(total,4),'name_score':round(ns,4),'strength_score':round(ss,4),'strength_conflict':bool(conflict)})
    # Explicit NO_MATCH: never leak a random SKU for low-similarity text.
    if top[1] < 0.70:
        return Resolution('NO_MATCH',None,None,round(top[0],4),'no catalogue candidate is similar enough',cand,True,cand[0]['master_product_id'],cand[0]['product_name'])
    lasa,reason=lasa_guard(q,top[4].product_name,second[4].product_name if second[4] else None,top[0],second[0])
    if lasa:
        return Resolution('BLOCKED_LASA',None,None,round(top[0],4),reason,cand,True,cand[0]['master_product_id'],cand[0]['product_name'])
    if top[3]:
        return Resolution('REVIEW',None,None,round(top[0],4),'strength conflicts with best catalogue candidate',cand,True,cand[0]['master_product_id'],cand[0]['product_name'])
    if top[4].is_discontinued:
        return Resolution('REVIEW',None,None,round(top[0],4),'DISCONTINUED_PRODUCT',cand,True,cand[0]['master_product_id'],cand[0]['product_name'])
    # identity confidence: lexical, margin, OCR confidence, independent reader agreement.
    ocr=max(0.0,min(1.0,float(line.ocr_confidence or 0)))
    agree=max(0.0,min(1.0,float(line.reader_agreement or 0)))
    z=-7.2 + 8.5*top[1] + 3.5*max(0.0,margin) + 1.1*ocr + 0.8*agree + 0.7*top[2]
    prob=1/(1+math.exp(-max(-25,min(25,z))))
    # High precision routing; quantity is an independent order-readiness gate.
    exact_full = norm_text(q) == norm_text(top[4].product_name)
    exactish = top[1]>=0.94 and margin>=0.08
    # For an exact catalogue string, allow either strong source confidence or independent-reader agreement.
    # For fuzzy reads, keep the stricter calibrated threshold.
    source_support = (ocr>=0.78) or (line.reader_votes>=2 and agree>=0.72)
    safe_identity = (exact_full and source_support and prob>=0.93) or (exactish and prob>=0.965 and ocr>=0.50 and line.reader_votes>=2)
    if safe_identity:
        if line.quantity is None or float(line.quantity)<=0:
            return Resolution('REVIEW',None,None,round(prob,4),'medicine is likely resolved but quantity is missing/unsafe',cand,True,cand[0]['master_product_id'],cand[0]['product_name'])
        if line.line_status!='ACTIVE':
            return Resolution('REVIEW',None,None,round(prob,4),f'line status is {line.line_status}',cand,True,cand[0]['master_product_id'],cand[0]['product_name'])
        return Resolution('AUTO_ACCEPT',top[4].master_product_id,top[4].product_name,round(prob,4),'high-confidence catalogue match with valid quantity',cand,False,top[4].master_product_id,top[4].product_name)
    return Resolution('REVIEW',None,None,round(prob,4),'candidate requires human confirmation',cand,True,cand[0]['master_product_id'],cand[0]['product_name'])
