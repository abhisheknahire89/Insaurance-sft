import pytest
from app.db import get_db

@pytest.fixture
def db():
    # Use memory database for sqlite tests
    import tempfile
    import os
    with tempfile.NamedTemporaryFile(delete=False) as f:
        path = f.name
    _db = get_db(path)
    yield _db
    os.unlink(path)

def test_db_contract(db):
    # 1. Create order
    payload = {"items": [{"master_product_id": "M1", "quantity": 10}]}
    order_id = db.create_order("Test Pharmacy", payload)
    assert order_id > 0
    
    # 2. Get order
    order = db.get_order(order_id)
    assert order["pharmacy_name"] == "Test Pharmacy"
    assert order["status"] == "PLACED"
    assert len(order["payload"]["items"]) == 1
    
    # 3. Update status
    db.update_order_status(order_id, "CONFIRMED")
    order = db.get_order(order_id)
    assert order["status"] == "CONFIRMED"
    
    # 4. Save Invoice
    inv_payload = {"items": []}
    reconciliation = {"clean_match": True}
    inv_id = db.save_invoice(order_id, {"invoice_number": "INV-1"}, inv_payload, reconciliation)
    assert inv_id > 0
    
    # 5. List orders
    orders = db.list_orders()
    assert len(orders) == 1
    assert orders[0]["id"] == order_id
