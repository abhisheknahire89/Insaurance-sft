from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor,as_completed
from pathlib import Path
from .providers import SarvamDocAI,TesseractBaseline
from .preprocess import create_variants
from .quality import image_quality
from .fusion import fuse_many
from .catalog import CatalogRow, resolve
from .lexicon import CatalogIndex
from .normalize import norm_text
from .demo_data import get_deterministic_inventory, DEMO_SUPPLIERS

def supplier_options_demo(master_product_id:str, quantity:float):
    opts = []
    # Use price_base 100 as default to generate deterministic price. 
    # In a real system, we'd lookup base price. Here, get_deterministic_inventory generates it reliably based on the ID.
    for supplier in DEMO_SUPPLIERS:
        inv = get_deterministic_inventory(master_product_id, supplier['id'], 150.0)
        available_qty = inv['stock'] if inv['is_available'] else 0
        can_fulfil = available_qty >= quantity
        
        eta_dt = datetime.now() + timedelta(days=supplier['lead_time_days'])
        eta_date = eta_dt.strftime('%Y-%m-%d')
        
        if supplier['lead_time_days'] == 1:
            eta_label = "Tomorrow"
        elif supplier['lead_time_days'] == 0:
            eta_label = "Today"
        else:
            eta_label = f"In {supplier['lead_time_days']} days"
            
        opts.append({
            'supplier_id': supplier['id'],
            'supplier_name': supplier['name'],
            'master_product_id': master_product_id,
            'requested_qty': quantity,
            'available_qty': available_qty,
            'unit_price': inv['rate'],
            'line_total': round(inv['rate'] * quantity, 2),
            'eta_date': eta_date,
            'eta_label': eta_label,
            'can_fulfil': can_fulfil
        })
    return opts

from .validate import enforce_contract
from .parser import parse_text_block
from .models import InvoiceLine
from .reconcile import reconcile


def _extract_sarvam_view(path,language,key):
    return SarvamDocAI(key).extract_wantslip(path,language)

def process_wantslip(src:str,catalog:list[CatalogRow],cat_index:CatalogIndex,api_key:str|None,language='en-IN',accuracy_mode='maximum',runtime_dir:str='.runtime',db_conn=None)->dict:
    variants=create_variants(src,runtime_dir)
    if accuracy_mode=='fast': names=['original']
    elif accuracy_mode=='accurate': names=['original','balanced']
    else: names=['original','balanced','rot90','rot270']
    reads=[]; errors=[]
    # OCR Cascade: Sequential fallback to avoid unnecessary Sarvam API latency/cost.
    # A read is considered "SAFE" if it extracts lines with high confidence.
    import time
    for n in names:
        try:
            r = _extract_sarvam_view(variants[n], language, api_key)
            reads.append(r)
            if not r: continue
            avg_conf = sum(x.ocr_confidence for x in r) / len(r)
            if avg_conf > 0.85 and len(r) > 0:
                break # SAFE, skip further passes
        except Exception as e:
            errors.append(f'{n}: {e}')
    if not reads: raise RuntimeError('All Sarvam OCR passes failed: '+' | '.join(errors))
    fused=fuse_many(reads)
    items=[]
    for line in fused:
        correction=None
        if db_conn is not None:
            from .db import correction_for
            correction=correction_for(db_conn,norm_text(line.raw_text))
        res=enforce_contract(line,resolve(line,catalog,correction,cat_index))
        opts=supplier_options_demo(res.master_product_id,line.quantity) if res.master_product_id else []
        best=next((o for o in opts if o.can_fulfil),None)
        items.append({'input':line.__dict__,'resolution':res.__dict__,'suppliers':opts,'best_supplier':best})
    return {'mode':accuracy_mode,'passes_requested':names,'passes_succeeded':len(reads),'pass_errors':errors,'image_quality':image_quality(src),'items':items,
            'summary':{'lines':len(items),'auto_accept':sum(x['resolution']['decision']=='AUTO_ACCEPT' for x in items),'review':sum(x['resolution']['requires_review'] for x in items),
                       'ignored':sum(x['resolution']['decision']=='IGNORE' for x in items),'supplier_ready':sum(x['best_supplier'] is not None for x in items)}}

def process_text_requirement(text:str,catalog:list[CatalogRow],cat_index:CatalogIndex,db_conn=None)->dict:
    lines=parse_text_block(text,'typed_or_voice',.80); items=[]
    for line in lines:
        correction=None
        if db_conn is not None:
            from .db import correction_for
            correction=correction_for(db_conn,norm_text(line.raw_text))
        res=enforce_contract(line,resolve(line,catalog,correction,cat_index))
        opts=supplier_options_demo(res.master_product_id,line.quantity) if res.master_product_id else []
        best=next((o for o in opts if o.can_fulfil),None)
        items.append({'input':line.__dict__,'resolution':res.__dict__,'suppliers':opts,'best_supplier':best})
    return {'items':items,'summary':{'lines':len(items),'auto_accept':sum(x['resolution']['decision']=='AUTO_ACCEPT' for x in items),'review':sum(x['resolution']['requires_review'] for x in items),'supplier_ready':sum(x['best_supplier'] is not None for x in items)}}

def process_invoice(path:str,catalog:list[CatalogRow],cat_index:CatalogIndex,api_key:str|None,language='en-IN',order:dict|None=None)->dict:
    ext=SarvamDocAI(api_key).extract_invoice(path,language)
    for line in ext['lines']:
        from .models import OCRLine
        o=OCRLine(line.raw_text,line.product_name,line.quantity,line.unit,source_engine='invoice',ocr_confidence=line.ocr_confidence,quantity_role='ORDER_QUANTITY')
        r=resolve(o,catalog,index=cat_index)
        # Invoice matching may expose SKU only for an auto-safe identity; review otherwise.
        line.resolved_master_product_id=r.master_product_id; line.resolution_decision=r.decision
    payload={'header':ext['header'],'lines':[x.__dict__ for x in ext['lines']]}
    rec=reconcile(order,ext['header'],ext['lines']) if order else None
    return {'invoice':payload,'reconciliation':rec}
