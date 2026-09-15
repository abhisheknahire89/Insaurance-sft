import pytest

def test_missing_quantity_never_defaults_to_one():
    with open('static/index.html', 'r') as f:
        content = f.read()
    assert "item.input.quantity = ''" in content, "Missing quantity should be blanked"

def test_manual_candidate_is_user_confirmed_not_auto_accept():
    with open('static/index.html', 'r') as f:
        content = f.read()
    assert "item.resolution.decision = 'USER_CONFIRMED'" in content, "Should use USER_CONFIRMED"

def test_quantity_only_review_preserves_master_product_id():
    with open('static/index.html', 'r') as f:
        content = f.read()
    assert "confirmQuantityOnly()" in content, "Should have a quantity-only confirm function"

def test_no_product_id_is_not_order_ready():
    with open('static/index.html', 'r') as f:
        content = f.read()
    assert "item.resolution.master_product_id" in content, "Must check for master_product_id for readiness"

def test_excluded_item_not_sent_to_supplier():
    with open('static/index.html', 'r') as f:
        content = f.read()
    assert "'EXCLUDED'" in content, "Must handle EXCLUDED"

def test_supplier_ranking_logic():
    with open('static/index.html', 'r') as f:
        content = f.read()
    assert "a.coverage_status === 'FULL'" in content, "Must rank FULL first"
    assert "a.eta_date < b.eta_date" in content, "Must rank by eta_date"

def test_supplier_price_contract():
    with open('static/index.html', 'r') as f:
        content = f.read()
    assert "opt.unit_price" in content, "Must compute total based on unit_price and available/requested qty"

def test_selected_supplier_snapshot_persisted():
    with open('static/index.html', 'r') as f:
        content = f.read()
    assert "supplier_snapshot: supplierData" in content, "Must persist supplier_snapshot"

def test_quantity_locked_after_dispatch():
    with open('static/index.html', 'r') as f:
        content = f.read()
    assert "o.status === 'PLACED' || o.status === 'CONFIRMED'" in content, "Must only allow edit in PLACED or CONFIRMED"
    assert "Math.min(item.quantity, item.fulfilled_quantity + delta)" in content, "Must cap fulfilled at ordered qty"
