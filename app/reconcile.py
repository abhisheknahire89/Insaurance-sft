from __future__ import annotations
from collections import defaultdict
from .models import InvoiceLine


def reconcile(order:dict,invoice_header:dict,invoice_lines:list[InvoiceLine],price_abs_tol=.50,price_pct_tol=.01)->dict:
    ordered=defaultdict(list)
    for x in order.get('payload',{}).get('items',[]): ordered[x['master_product_id']].append(x)
    invoiced=defaultdict(list)
    for x in invoice_lines:
        if x.resolved_master_product_id: invoiced[x.resolved_master_product_id].append(x)
    rows=[]; seen=set()
    for sku,olist in ordered.items():
        oq=sum(float(x.get('quantity') or 0) for x in olist); expected_price=next((x.get('price') for x in olist if x.get('price') is not None),None)
        ilist=invoiced.get(sku,[]); iq=sum(float(x.quantity or 0) for x in ilist); free=sum(float(x.free_quantity or 0) for x in ilist)
        if not ilist: status='MISSING_FROM_INVOICE'
        elif abs(iq-oq)<1e-9: status='MATCH'
        elif iq<oq: status='SHORT_SUPPLY'
        else: status='EXCESS_SUPPLY'
        price_status='NOT_CHECKED'; inv_rate=next((x.rate for x in ilist if x.rate is not None),None)
        if expected_price is not None and inv_rate is not None:
            tol=max(price_abs_tol,abs(float(expected_price))*price_pct_tol)
            price_status='MATCH' if abs(float(inv_rate)-float(expected_price))<=tol else 'PRICE_MISMATCH'
        rows.append({'master_product_id':sku,'product_name':olist[0].get('product_name'),'ordered_qty':oq,'invoiced_qty':iq,'free_qty':free,'quantity_status':status,
                     'expected_price':expected_price,'invoice_rate':inv_rate,'price_status':price_status,
                     'batch':[x.batch for x in ilist if x.batch],'expiry':[x.expiry for x in ilist if x.expiry]})
        seen.add(sku)
    for sku,ilist in invoiced.items():
        if sku in seen:continue
        rows.append({'master_product_id':sku,'product_name':ilist[0].product_name,'ordered_qty':0,'invoiced_qty':sum(float(x.quantity or 0) for x in ilist),'free_qty':sum(float(x.free_quantity or 0) for x in ilist),
                     'quantity_status':'UNEXPECTED_ITEM','expected_price':None,'invoice_rate':next((x.rate for x in ilist if x.rate is not None),None),'price_status':'NOT_CHECKED',
                     'batch':[x.batch for x in ilist if x.batch],'expiry':[x.expiry for x in ilist if x.expiry]})
    unresolved=[{'raw_text':x.raw_text,'product_name':x.product_name,'quantity':x.quantity,'decision':x.resolution_decision} for x in invoice_lines if not x.resolved_master_product_id]
    clean=all(r['quantity_status']=='MATCH' and r['price_status'] in {'MATCH','NOT_CHECKED'} for r in rows) and not unresolved
    return {'clean_match':clean,'rows':rows,'unresolved_invoice_lines':unresolved,
            'summary':{'matched':sum(r['quantity_status']=='MATCH' for r in rows),'exceptions':sum(r['quantity_status']!='MATCH' or r['price_status']=='PRICE_MISMATCH' for r in rows)+len(unresolved)}}
