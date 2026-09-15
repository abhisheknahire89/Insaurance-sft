from __future__ import annotations
from .models import OCRLine, Resolution

def flat_contract(line:OCRLine,res:Resolution)->dict:
    return {
        'raw_text':line.raw_text,
        'medicine_name':line.medicine_name,
        'quantity':line.quantity,
        'unit':line.unit,
        'urgency':line.urgency,
        'master_product_id':res.master_product_id,
        'product_name':res.product_name,
        'decision':res.decision
    }
