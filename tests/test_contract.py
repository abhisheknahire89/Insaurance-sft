from app.models import OCRLine,Resolution
from app.validate import enforce_contract

def test_non_auto_decision_cannot_expose_sku():
    l=OCRLine('x','x',1)
    for d in ['REVIEW','NO_MATCH','BLOCKED_LASA','IGNORE']:
        r=Resolution(d,'DANGEROUS','Wrong',.8,'test')
        r=enforce_contract(l,r)
        assert r.master_product_id is None and r.product_name is None

def test_pack_volume_numeric_role_cannot_auto_order():
    l=OCRLine('DNS 500ml','DNS',500,quantity_role='PACK_OR_VOLUME',line_status='ACTIVE')
    r=Resolution('AUTO_ACCEPT','SKU','DNS',.99,'bad')
    r=enforce_contract(l,r)
    assert r.decision=='REVIEW' and r.master_product_id is None
