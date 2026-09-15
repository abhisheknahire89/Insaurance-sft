from __future__ import annotations
import csv
from .models import SupplierOption
from .dates import calculate_eta

def load_inventory(path:str)->list[dict]:
    with open(path,newline='',encoding='utf-8-sig') as f:return list(csv.DictReader(f))

def supplier_options(master_product_id:str,quantity:float|None,rows:list[dict])->list[SupplierOption]:
    need=float(quantity or 0); out=[]
    for r in rows:
        r_master=str(r.get('master_product_id') or r.get('sku') or '').strip().lower()
        if r_master!=str(master_product_id or '').strip().lower():continue
        supp_sku=str(r.get('supplier_sku') or r.get('sku') or 'UNKNOWN').strip()
        try: stock=float(r.get('stock') or 0)
        except: stock=0.0
        try: price=float(r.get('price')) if r.get('price') not in (None,'') else None
        except: price=None
        try: lead=float(r.get('lead_time_hours') or 24)
        except: lead=24
        eta=calculate_eta(lead,str(r.get('cutoff_time') or '16:00'),str(r.get('working_days') or '0,1,2,3,4,5'))
        out.append(SupplierOption(str(r.get('supplier') or 'Unknown'),supp_sku,stock,price,eta,stock>=need if need>0 else stock>0,min(stock,need) if need>0 else stock))
    out.sort(key=lambda x:(not x.can_fulfil,x.eta or '9999',x.price if x.price is not None else 1e18))
    return out
