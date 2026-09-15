from datetime import datetime
from zoneinfo import ZoneInfo
from app.dates import calculate_eta
from app.reconcile import reconcile
from app.models import InvoiceLine

def test_eta_after_cutoff_rolls_forward():
    now=datetime(2026,9,14,18,30,tzinfo=ZoneInfo('Asia/Kolkata'))
    eta=calculate_eta(4,'16:00','0,1,2,3,4,5',now)
    assert eta.startswith('2026-09-15T13:00')

def test_eta_skips_weekends():
    # Friday 2026-09-11 15:00. Lead time 24h. Working days 0,1,2,3,4 (Mon-Fri)
    # Business hours are 9-18 (9 hours a day). 24 hours means 2 full days + 6 hours.
    now=datetime(2026,9,11,15,0,tzinfo=ZoneInfo('Asia/Kolkata'))
    eta=calculate_eta(24,'16:00','0,1,2,3,4',now)
    # 3 hours on Friday (15-18)
    # 9 hours on Monday
    # 9 hours on Tuesday
    # 3 hours on Wednesday -> 12:00
    assert eta.startswith('2026-09-16T12:00')

def test_reconciliation_short_supply():
    order={'payload':{'items':[{'master_product_id':'SKU0001','product_name':'Dolo 650','quantity':15,'price':28}]}}
    inv=[InvoiceLine('Dolo 650','Dolo 650',12,rate=28,resolved_master_product_id='SKU0001',resolution_decision='AUTO_ACCEPT')]
    r=reconcile(order,{},inv)
    assert r['rows'][0]['quantity_status']=='SHORT_SUPPLY' and not r['clean_match']

def test_reconciliation_clean_match():
    order={'payload':{'items':[{'master_product_id':'SKU0001','product_name':'Dolo 650','quantity':15,'price':28}]}}
    inv=[InvoiceLine('Dolo 650','Dolo 650',15,rate=28,resolved_master_product_id='SKU0001',resolution_decision='AUTO_ACCEPT')]
    r=reconcile(order,{},inv)
    assert r['rows'][0]['quantity_status']=='MATCH' and r['clean_match']

def test_reconciliation_price_mismatch():
    order={'payload':{'items':[{'master_product_id':'SKU0001','product_name':'Dolo 650','quantity':15,'price':28}]}}
    inv=[InvoiceLine('Dolo 650','Dolo 650',15,rate=35,resolved_master_product_id='SKU0001',resolution_decision='AUTO_ACCEPT')]
    r=reconcile(order,{},inv)
    assert r['rows'][0]['price_status']=='PRICE_MISMATCH' and not r['clean_match']

