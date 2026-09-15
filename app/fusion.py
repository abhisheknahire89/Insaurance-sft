from __future__ import annotations
from dataclasses import replace
from typing import List
from rapidfuzz.fuzz import WRatio
from .models import OCRLine
from .normalize import norm_text, first_alnum

def _sim(a:OCRLine,b:OCRLine)->float:
    an=a.medicine_name or a.raw_text; bn=b.medicine_name or b.raw_text
    import re
    nums_a=set(re.findall(r'\b\d+(?:\.\d+)?\b', norm_text(an)))
    nums_b=set(re.findall(r'\b\d+(?:\.\d+)?\b', norm_text(bn)))
    # Never fuse two clearly different numeric variants such as Dolo 650 vs Dolo 500.
    if nums_a and nums_b and nums_a.isdisjoint(nums_b):
        return 0.0
    n=WRatio(an,bn)/100.0
    if a.group_name and b.group_name:
        g=WRatio(a.group_name,b.group_name)/100.0
        if g<.45:return 0.0
    else:g=.55
    if a.quantity is not None and b.quantity is not None:q=1.0 if float(a.quantity)==float(b.quantity) else .0
    else:q=.55
    return .82*n+.10*q+.08*g

def fuse_many(reads:List[List[OCRLine]])->List[OCRLine]:
    if not reads:return []
    clusters=[]
    for ri,lines in enumerate(reads):
        used=set()
        for line in lines:
            best=None
            for ci,c in enumerate(clusters):
                # at most one line from a reader in one cluster
                if ri in c['readers']:continue
                s=_sim(c['rep'],line)
                if s>=.66 and (best is None or s>best[0]):best=(s,ci)
            if best is None:
                clusters.append({'rep':line,'members':[line],'readers':{ri},'sims':[]})
            else:
                s,ci=best;c=clusters[ci];c['members'].append(line);c['readers'].add(ri);c['sims'].append(s)
                if line.ocr_confidence>c['rep'].ocr_confidence:c['rep']=line
    out=[]
    total=max(1,len(reads))
    for c in clusters:
        rep=c['rep']; members=c['members']; votes=len(c['readers'])
        agreement=sum(c['sims'])/len(c['sims']) if c['sims'] else 0.0
        qs={float(m.quantity) for m in members if m.quantity is not None}
        statuses={m.line_status for m in members}
        names=[m.medicine_name for m in members if m.medicine_name]
        notes=[m.notes for m in members if m.notes]
        initials={first_alnum(n) for n in names if first_alnum(n)}
        if len(qs)>1:
            status='UNCERTAIN'; notes.append('quantity_conflict='+','.join(map(str,sorted(qs))))
        elif len(initials)>1:
            status='UNCERTAIN'; notes.append('name_initial_conflict='+','.join(sorted(initials)))
        elif 'CROSSED_OUT' in statuses and 'ACTIVE' in statuses:
            status='UNCERTAIN'; notes.append('line_status_conflict')
        else:status=rep.line_status
        q=next(iter(qs)) if len(qs)==1 else rep.quantity if len(qs)<=1 else None
        # Reader agreement should support, never override, lexical safety.
        rep=replace(rep,quantity=q,line_status=status,reader_votes=votes,reader_agreement=round(agreement,4),
            ocr_confidence=max(m.ocr_confidence for m in members),notes='; '.join([*notes,f'reader_votes={votes}/{total}',f'readings={" | ".join(names)}']))
        out.append(rep)
    return out
