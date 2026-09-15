from __future__ import annotations
import re, unicodedata

MULT_SIGNS = "xX×✕✖✗*"

CONFUSION_EQUIV = {
    '0': 'o', 'O': 'o',
    '1': 'l', 'I': 'l', '|': 'l',
    '5': 's', '$': 's',
    '8': 'b',
}

def strip_accents(s: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFKD', s or '') if not unicodedata.combining(c))

def norm_text(s: str) -> str:
    s = strip_accents(s or '').lower()
    s = s.replace('×', ' x ').replace('✕', ' x ').replace('✖', ' x ').replace('✗', ' x ')
    s = re.sub(r"[^a-z0-9%+./-]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def compact(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", norm_text(s))

def brand_root(s: str) -> str:
    x = norm_text(s)
    x = re.sub(r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|%|gm)\b", " ", x)
    x = re.sub(r"\b(?:tab(?:let)?s?|cap(?:sule)?s?|syp|syrup|gel|cream|lotion|wash|shampoo|inj(?:ection)?|drops?|ointment|spray|sachet|powder|solution)\b", " ", x)
    x = re.sub(r"\s+", " ", x).strip()
    return x

def first_alnum(s: str) -> str:
    m = re.search(r"[a-z0-9]", norm_text(s))
    return m.group(0) if m else ""

def soundex(s: str) -> str:
    s = re.sub(r"[^a-z]", "", brand_root(s))
    if not s:
        return ""
    first = s[0]
    mapping = {
        **{c:'1' for c in 'bfpv'}, **{c:'2' for c in 'cgjkqsxz'},
        **{c:'3' for c in 'dt'}, **{c:'4' for c in 'l'},
        **{c:'5' for c in 'mn'}, **{c:'6' for c in 'r'},
    }
    digits=[]; prev=''
    for c in s[1:]:
        d=mapping.get(c,'')
        if d and d!=prev: digits.append(d)
        prev=d
    return (first + ''.join(digits) + '000')[:4]

def trigrams(s: str) -> set[str]:
    s = f"  {brand_root(s)}  "
    return {s[i:i+3] for i in range(max(0, len(s)-2))}
