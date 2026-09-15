from __future__ import annotations
from datetime import datetime, timedelta
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


def _eta_date(lead_time_days: int) -> str:
    """Return ISO date string for today + lead_time_days."""
    return (datetime.now() + timedelta(days=lead_time_days)).strftime('%Y-%m-%d')


def supplier_options_demo(master_product_id: str, quantity: float) -> list[dict]:
    """
    Return per-line supplier options for a single master_product_id.
    Used by the OCR pipeline and GET /api/suppliers.
    """
    opts = []
    need = float(quantity or 0)
    for supplier in DEMO_SUPPLIERS:
        inv = get_deterministic_inventory(master_product_id, supplier['id'], 150.0)
        available_qty = float(inv['stock'])
        fulfillable_qty = min(available_qty, need) if need > 0 else available_qty

        if available_qty >= need and need > 0:
            coverage_status = 'FULL'
        elif available_qty > 0:
            coverage_status = 'PARTIAL'
        else:
            coverage_status = 'UNAVAILABLE'

        reference_price = 150.0
        unit_price = inv['rate']
        line_total = round(unit_price * fulfillable_qty, 2)

        opts.append({
            'supplier_id': supplier['id'],
            'supplier_name': supplier['name'],
            'location': supplier['location'],
            'master_product_id': master_product_id,
            'supplier_sku': inv['supplier_sku'],
            'requested_qty': need,
            'available_qty': available_qty,
            'fulfillable_qty': fulfillable_qty,
            'coverage_status': coverage_status,
            'reference_price': reference_price,
            'unit_price': unit_price,
            'line_total': line_total,
            'lead_time_days': supplier['lead_time_days'],
            'eta_date': _eta_date(supplier['lead_time_days']),
            'eta_label': supplier['eta_label'],
            'can_fulfil': coverage_status == 'FULL',
        })
    return opts


def compare_suppliers(items: list[dict]) -> dict:
    """
    Whole-order supplier comparison.

    items: list of {master_product_id, product_name, quantity}
    Returns all 4 suppliers ranked by: FULL > PARTIAL, then ETA, then price.
    """
    today = datetime.now()
    results: list[dict] = []

    for supplier in DEMO_SUPPLIERS:
        sid = supplier['id']
        lines = []
        full_count = 0
        partial_count = 0
        unavail_count = 0
        req_qty_total = 0.0
        fulfil_qty_total = 0.0
        estimated_total = 0.0

        for item in items:
            mid = str(item.get('master_product_id', ''))
            qty = float(item.get('quantity', 1) or 1)
            name = item.get('product_name', '')

            inv = get_deterministic_inventory(mid, sid, 150.0)
            avail = float(inv['stock'])
            fulfil = min(avail, qty)

            if avail >= qty:
                status = 'FULL'
                full_count += 1
            elif avail > 0:
                status = 'PARTIAL'
                partial_count += 1
            else:
                status = 'UNAVAILABLE'
                unavail_count += 1

            req_qty_total += qty
            fulfil_qty_total += fulfil
            line_total = round(inv['rate'] * fulfil, 2)
            estimated_total += line_total

            lines.append({
                'master_product_id': mid,
                'product_name': name,
                'supplier_sku': inv['supplier_sku'],
                'requested_qty': qty,
                'available_qty': avail,
                'fulfillable_qty': fulfil,
                'coverage_status': status,
                'unit_price': inv['rate'],
                'line_total': line_total,
            })

        requested_line_count = len(items)
        if full_count == requested_line_count:
            cov_status = 'FULL'
        elif full_count > 0 or partial_count > 0:
            cov_status = 'PARTIAL'
        else:
            cov_status = 'UNAVAILABLE'

        line_coverage_ratio = (
            (full_count + partial_count) / requested_line_count
            if requested_line_count > 0 else 0.0
        )
        qty_coverage_ratio = (
            fulfil_qty_total / req_qty_total
            if req_qty_total > 0 else 0.0
        )

        eta_date = _eta_date(supplier['lead_time_days'])

        results.append({
            'supplier_id': sid,
            'supplier_name': supplier['name'],
            'location': supplier['location'],
            'profile_label': supplier['profile_label'],
            'requested_line_count': requested_line_count,
            'full_line_count': full_count,
            'partial_line_count': partial_count,
            'unavailable_line_count': unavail_count,
            'coverage_status': cov_status,
            'line_coverage_ratio': round(line_coverage_ratio, 3),
            'quantity_coverage_ratio': round(qty_coverage_ratio, 3),
            'estimated_total': round(estimated_total, 2),
            'lead_time_days': supplier['lead_time_days'],
            'eta_date': eta_date,
            'eta_label': supplier['eta_label'],
            'lines': lines,
        })

    # Rank: FULL > PARTIAL > UNAVAILABLE; then ETA asc; then price asc
    def rank_key(s: dict):
        cov_order = {'FULL': 0, 'PARTIAL': 1, 'UNAVAILABLE': 2}
        cov_rank = cov_order.get(s['coverage_status'], 2)
        # For PARTIAL, rank by line_coverage_ratio desc (negate)
        return (
            cov_rank,
            -s['line_coverage_ratio'],
            -s['quantity_coverage_ratio'],
            s['eta_date'],
            s['estimated_total'],
        )

    results.sort(key=rank_key)
    return {'suppliers': results}

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
