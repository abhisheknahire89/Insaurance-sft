from __future__ import annotations
from datetime import datetime,timedelta,time
from zoneinfo import ZoneInfo

IST=ZoneInfo('Asia/Kolkata')

def _parse_days(s:str)->set[int]:
    if not s:return {0,1,2,3,4,5}
    out=set()
    for x in str(s).split(','):
        try: out.add(int(x.strip()))
        except: pass
    return out or {0,1,2,3,4,5}

def _next_working(dt:datetime,days:set[int],opening=time(9,0))->datetime:
    x=dt
    while x.weekday() not in days:
        x=datetime.combine((x+timedelta(days=1)).date(),opening,tzinfo=x.tzinfo)
    return x

def calculate_eta(lead_time_hours:float, cutoff_time:str='16:00', working_days:str='0,1,2,3,4,5', now:datetime|None=None)->str:
    now=now.astimezone(IST) if now else datetime.now(IST)
    days=_parse_days(working_days)
    try:
        hh,mm=[int(x) for x in cutoff_time.split(':')[:2]]
        cutoff=time(hh,mm)
    except: cutoff=time(16,0)
    start=now
    if start.weekday() not in days or start.timetz().replace(tzinfo=None)>cutoff:
        start=datetime.combine((start+timedelta(days=1)).date(),time(9,0),tzinfo=IST)
        start=_next_working(start,days)
    remaining=float(lead_time_hours or 0)
    cur=start
    # add business hours in 9:00-18:00 working windows.
    while remaining>0:
        cur=_next_working(cur,days)
        if cur.timetz().replace(tzinfo=None)<time(9,0): cur=datetime.combine(cur.date(),time(9,0),tzinfo=IST)
        if cur.timetz().replace(tzinfo=None)>=time(18,0):
            cur=_next_working(datetime.combine((cur+timedelta(days=1)).date(),time(9,0),tzinfo=IST),days); continue
        end=datetime.combine(cur.date(),time(18,0),tzinfo=IST)
        avail=(end-cur).total_seconds()/3600
        step=min(avail,remaining); cur += timedelta(hours=step); remaining-=step
        if remaining>0: cur=datetime.combine((cur+timedelta(days=1)).date(),time(9,0),tzinfo=IST)
    return cur.isoformat(timespec='minutes')
