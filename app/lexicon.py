from __future__ import annotations
from dataclasses import dataclass
from typing import Iterable, List
from rapidfuzz.fuzz import WRatio, ratio, token_set_ratio
from .normalize import norm_text, brand_root, soundex, trigrams, compact

OCR_SUB_COST = {
    ('u','v'):0.25,('v','u'):0.25,('i','l'):0.25,('l','i'):0.25,('o','0'):0.2,('0','o'):0.2,
    ('s','5'):0.25,('5','s'):0.25,('b','8'):0.3,('8','b'):0.3,('c','e'):0.45,('e','c'):0.45,
    ('r','v'):0.55,('n','m'):0.55,('m','n'):0.55,
}

def weighted_edit(a: str,b: str)->float:
    a=compact(a); b=compact(b)
    if not a and not b:return 0.0
    if not a or not b:return float(max(len(a),len(b)))
    prev=[float(i) for i in range(len(b)+1)]
    for i,ca in enumerate(a,1):
        cur=[float(i)]
        for j,cb in enumerate(b,1):
            sub=0.0 if ca==cb else OCR_SUB_COST.get((ca,cb),1.0)
            cur.append(min(cur[-1]+1.0, prev[j]+1.0, prev[j-1]+sub))
        prev=cur
    return prev[-1]

def weighted_similarity(a:str,b:str)->float:
    den=max(1,len(compact(a)),len(compact(b)))
    return max(0.0,1.0-weighted_edit(a,b)/den)

def score_name(q:str,target:str)->float:
    qn=brand_root(q); tn=brand_root(target)
    wr=WRatio(qn,tn)/100.0; rr=ratio(qn,tn)/100.0; ts=token_set_ratio(qn,tn)/100.0
    we=weighted_similarity(qn,tn)
    ph=1.0 if soundex(qn) and soundex(qn)==soundex(tn) else 0.0
    return 0.30*wr+0.20*rr+0.15*ts+0.30*we+0.05*ph

class CatalogIndex:
    def __init__(self, rows):
        self.rows=rows
        self.exact_idx={}
        self.trigram_idx={}
        self.token_idx={}
        self.prefix_idx={}
        
        for i,r in enumerate(rows):
            norm = norm_text(r.product_name)
            self.exact_idx.setdefault(norm, set()).add(i)
            if r.aliases:
                self.exact_idx.setdefault(norm_text(r.aliases), set()).add(i)
                
            for g in trigrams(norm):
                self.trigram_idx.setdefault(g,set()).add(i)
            
            tokens = norm.split()
            for t in tokens:
                self.token_idx.setdefault(t, set()).add(i)
                if len(t) > 3:
                    self.prefix_idx.setdefault(t[:3], set()).add(i)
                    self.prefix_idx.setdefault(t[:4], set()).add(i)

    def candidates(self,query:str,limit:int=100):
        norm_q = norm_text(query)
        if norm_q in self.exact_idx:
            return [self.rows[i] for i in self.exact_idx[norm_q]]
        
        counts={}
        grams=trigrams(norm_q)
        for g in grams:
            for i in self.trigram_idx.get(g,set()): counts[i]=counts.get(i,0)+1
            
        for t in norm_q.split():
            for i in self.token_idx.get(t, set()): counts[i]=counts.get(i,0)+2
            if len(t) > 3:
                for p in [t[:3], t[:4]]:
                    for i in self.prefix_idx.get(p, set()): counts[i]=counts.get(i,0)+1
                    
        if not counts: return self.rows[:limit]
        ranked=sorted(counts, key=lambda i:(counts[i], -i), reverse=True)[:limit]
        return [self.rows[i] for i in ranked]
