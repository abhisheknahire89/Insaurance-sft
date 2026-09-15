from __future__ import annotations
from .normalize import first_alnum, brand_root
from rapidfuzz.fuzz import ratio

# Known/example LASA pairs can be extended from customer data. Symmetric normalized roots.
KNOWN_PAIRS = {
    frozenset({'u wash','v wash'}),
}

def lasa_guard(query: str, top_name: str, second_name: str|None, top_score: float, second_score: float) -> tuple[bool,str]:
    q=brand_root(query); t=brand_root(top_name); s=brand_root(second_name or '')
    if not q or not t:return True,'insufficient brand text'
    if frozenset({q,t}) in KNOWN_PAIRS:
        return True,'known LASA/confusable pair'
    # Initial glyph mismatch is dangerous when strings are otherwise very close (V-Wash vs U-Wash).
    if first_alnum(q) and first_alnum(t) and first_alnum(q)!=first_alnum(t) and ratio(q,t)>=78:
        return True,'brand initial conflicts with a look-alike candidate'
    if second_name and (top_score-second_score)<0.06 and ratio(t,s)>=70:
        return True,'top two catalogue candidates are too close'
    return False,''
