from __future__ import annotations
from .models import OCRLine, Resolution

def enforce_contract(line:OCRLine,res:Resolution)->Resolution:
    # Structural safety: only AUTO_ACCEPT may expose a committed SKU.
    if res.decision!='AUTO_ACCEPT':
        res.master_product_id=None; res.product_name=None
    safe_qty_roles={'ORDER_QUANTITY','EXPLICIT_MULTIPLIER','EXPLICIT_QTY_LABEL','NUMBER_WITH_ORDER_UNIT','WORD_NUMBER_WITH_ORDER_UNIT'}
    if not line.is_order_line or line.line_status in {'CROSSED_OUT','NOTE'}:
        res.decision='IGNORE'; res.reason='not an active order line'; res.master_product_id=None; res.product_name=None; res.requires_review=False
        return res
    if res.decision=='AUTO_ACCEPT':
        if line.quantity is None or float(line.quantity)<=0 or line.quantity_role not in {'ORDER_QUANTITY','UNKNOWN'}:
            res.decision='REVIEW'; res.reason='quantity missing/invalid or numeric role is not proven as order quantity'; res.master_product_id=None; res.product_name=None; res.requires_review=True
        elif line.line_status!='ACTIVE':
            res.decision='REVIEW'; res.reason=f'line status {line.line_status}'; res.master_product_id=None; res.product_name=None; res.requires_review=True
    return res
