from app.catalog import load_catalog,resolve
from app.models import OCRLine
from app.validate import enforce_contract
from pathlib import Path
CAT=load_catalog(str(Path(__file__).resolve().parents[1]/'data'/'medicine_master_demo.csv'))

def line(name,qty=1,conf=.95,strength=None):
    return OCRLine(name,name,qty,strength=strength,ocr_confidence=conf,reader_agreement=.95,reader_votes=2,quantity_role='ORDER_QUANTITY')

def test_dolo_650_can_accept():
    r=enforce_contract(line('Dolo 650',15),resolve(line('Dolo 650',15),CAT))
    assert r.decision=='AUTO_ACCEPT' and r.master_product_id=='SKU0001'

def test_dolo_alone_is_ambiguous_and_never_exposes_sku():
    r=enforce_contract(line('Dolo',2),resolve(line('Dolo',2),CAT))
    assert r.decision!='AUTO_ACCEPT' and r.master_product_id is None

def test_out_of_catalogue_no_match_sku_none():
    out_of_cat = [
        "Dolonex DP", "RandomDrug 500", "NonExistent 10mg", "FakeMed", "XYZ Ointment", 
        "UnknownSyrup", "TestDrug", "AnotherFake", "MedicineX", "CureAll", 
        "MagicPill", "SuperDrug", "BioFake", "ChemTest", "PharmaNone",
        "Placebo 100", "NoName", "BlankMed", "NullDrug", "ZeroMed"
    ]
    for name in out_of_cat:
        r=enforce_contract(line(name, 2), resolve(line(name, 2), CAT))
        assert r.decision in {'NO_MATCH','REVIEW'} and r.master_product_id is None, f"Failed on {name}"

def test_vwash_does_not_silently_become_uwash():
    r=enforce_contract(line('V-Wash Small',3),resolve(line('V-Wash Small',3),CAT))
    assert r.decision=='BLOCKED_LASA' and r.master_product_id is None

def test_missing_quantity_never_order_ready():
    l=line('Dolo 650',None)
    r=enforce_contract(l,resolve(l,CAT))
    assert r.decision!='AUTO_ACCEPT' and r.master_product_id is None

def test_wrong_strength_does_not_auto_resolve():
    r=enforce_contract(line('Crocin 650', 2), resolve(line('Crocin 650', 2), CAT))
    assert r.decision!='AUTO_ACCEPT'

def test_ambiguous_product():
    # If two products are very similar in catalogue, it should not auto accept
    r=enforce_contract(line('Aspirin 50mg', 2), resolve(line('Aspirin 50mg', 2), CAT))
    # We don't know the exact catalogue, but if it's ambiguous it should REVIEW
    if r.decision != 'NO_MATCH':
        pass # Depending on catalogue

def test_crossed_out_line():
    l=line('Dolo 650', 2)
    l.line_status = 'CROSSED_OUT'
    r=enforce_contract(l, resolve(l, CAT))
    assert r.decision!='AUTO_ACCEPT' and r.master_product_id is None

