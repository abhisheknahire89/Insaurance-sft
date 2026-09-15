"""
Automated tests for the deterministic supplier engine.
Run: pytest tests/test_suppliers.py -v
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from app.demo_data import get_deterministic_inventory, DEMO_SUPPLIERS
from app.service import compare_suppliers, supplier_options_demo


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

SAMPLE_ITEMS = [
    {"master_product_id": "12345", "product_name": "Dolo 650",    "quantity": 10},
    {"master_product_id": "67890", "product_name": "Pan 40",       "quantity": 5},
    {"master_product_id": "11111", "product_name": "Allegra 120",  "quantity": 6},
    {"master_product_id": "22222", "product_name": "Metformin 500","quantity": 20},
    {"master_product_id": "33333", "product_name": "Atorva 10",    "quantity": 15},
]

# ---------------------------------------------------------------------------
# 1. Determinism — same inputs always yield same outputs
# ---------------------------------------------------------------------------

def test_inventory_is_deterministic():
    r1 = get_deterministic_inventory("12345", "SUP001", 150.0)
    r2 = get_deterministic_inventory("12345", "SUP001", 150.0)
    assert r1 == r2, "Same product+supplier must return identical inventory"


def test_inventory_differs_by_supplier():
    abc  = get_deterministic_inventory("12345", "SUP001", 150.0)
    med  = get_deterministic_inventory("12345", "SUP002", 150.0)
    city = get_deterministic_inventory("12345", "SUP003", 150.0)
    hb   = get_deterministic_inventory("12345", "SUP004", 150.0)
    # All four should not be identical to each other
    units = {abc["rate"], med["rate"], city["rate"], hb["rate"]}
    # Statistically near-impossible for all 4 to match
    assert len(units) >= 2, "Different suppliers should produce different pricing"


def test_inventory_differs_by_product():
    r1 = get_deterministic_inventory("AAA", "SUP001", 150.0)
    r2 = get_deterministic_inventory("BBB", "SUP001", 150.0)
    assert r1 != r2, "Different products must produce different inventory"


# ---------------------------------------------------------------------------
# 2. Coverage status logic
# ---------------------------------------------------------------------------

def test_full_coverage_status():
    """If stock >= requested, coverage_status must be FULL."""
    opts = supplier_options_demo("12345", 1)   # qty=1, tiny request
    full_opts = [o for o in opts if o["available_qty"] >= 1 and 1 > 0]
    for o in full_opts:
        assert o["coverage_status"] == "FULL", \
            f"{o['supplier_name']}: qty 1 with stock={o['available_qty']} should be FULL"


def test_unavailable_coverage_status():
    """stock==0 must yield UNAVAILABLE."""
    # Find a product+supplier that hashes to 0 stock
    # We'll check by brute forcing known cases from demo data
    for supplier in DEMO_SUPPLIERS:
        inv = get_deterministic_inventory("99999", supplier["id"], 150.0)
        if inv["stock"] == 0:
            opts = supplier_options_demo("99999", 5)
            opt = next(o for o in opts if o["supplier_id"] == supplier["id"])
            assert opt["coverage_status"] == "UNAVAILABLE"
            return  # found one, test passes
    pytest.skip("No unavailable supplier found for test product 99999")


def test_partial_coverage_status():
    """stock > 0 but stock < qty → PARTIAL."""
    # Find a product where some supplier has 0 < stock < requested
    for mid in ["AAA", "BBB", "CCC", "DDD", "EEE", "12345", "67890"]:
        opts = supplier_options_demo(mid, 1000)  # huge qty ensures partials
        partials = [o for o in opts if 0 < o["available_qty"] < 1000]
        if partials:
            for p in partials:
                assert p["coverage_status"] == "PARTIAL", \
                    f"stock={p['available_qty']} < 1000 should be PARTIAL"
            return
    pytest.skip("No partial supplier found for tested products")


# ---------------------------------------------------------------------------
# 3. compare_suppliers whole-order
# ---------------------------------------------------------------------------

def test_compare_returns_all_4_suppliers():
    result = compare_suppliers(SAMPLE_ITEMS)
    assert len(result["suppliers"]) == 4


def test_compare_ranking_full_before_partial():
    """FULL suppliers must always rank before PARTIAL."""
    result = compare_suppliers(SAMPLE_ITEMS)
    suppliers = result["suppliers"]
    cov_order = {"FULL": 0, "PARTIAL": 1, "UNAVAILABLE": 2}
    for i in range(len(suppliers) - 1):
        a = cov_order[suppliers[i]["coverage_status"]]
        b = cov_order[suppliers[i+1]["coverage_status"]]
        assert a <= b, (
            f"Ranking violation: {suppliers[i]['supplier_name']} ({suppliers[i]['coverage_status']}) "
            f"before {suppliers[i+1]['supplier_name']} ({suppliers[i+1]['coverage_status']})"
        )


def test_compare_line_counts_sum_correctly():
    result = compare_suppliers(SAMPLE_ITEMS)
    for s in result["suppliers"]:
        total = s["full_line_count"] + s["partial_line_count"] + s["unavailable_line_count"]
        assert total == len(SAMPLE_ITEMS), \
            f"{s['supplier_name']}: line counts don't sum to {len(SAMPLE_ITEMS)}"


def test_compare_estimated_total_is_positive():
    result = compare_suppliers(SAMPLE_ITEMS)
    for s in result["suppliers"]:
        # Estimated total must be >= 0 (could be 0 if all unavailable)
        assert s["estimated_total"] >= 0


def test_compare_coverage_ratios_in_range():
    result = compare_suppliers(SAMPLE_ITEMS)
    for s in result["suppliers"]:
        assert 0.0 <= s["line_coverage_ratio"] <= 1.0
        assert 0.0 <= s["quantity_coverage_ratio"] <= 1.0


def test_compare_eta_fields_present():
    result = compare_suppliers(SAMPLE_ITEMS)
    for s in result["suppliers"]:
        assert s["eta_date"], f"{s['supplier_name']} missing eta_date"
        assert s["eta_label"], f"{s['supplier_name']} missing eta_label"


def test_compare_location_present():
    result = compare_suppliers(SAMPLE_ITEMS)
    for s in result["suppliers"]:
        assert s["location"], f"{s['supplier_name']} missing location"


# ---------------------------------------------------------------------------
# 4. Excluded items contract
# ---------------------------------------------------------------------------

def test_excluded_items_not_included():
    """compare_suppliers only operates on items passed to it; excluded items
    are filtered by the frontend before calling the API."""
    # Only 2 ready items — supplier counts should be 2, not more
    two_items = SAMPLE_ITEMS[:2]
    result = compare_suppliers(two_items)
    for s in result["suppliers"]:
        assert s["requested_line_count"] == 2, \
            "requested_line_count must equal len(items) passed"


# ---------------------------------------------------------------------------
# 5. Supplier profile fields
# ---------------------------------------------------------------------------

def test_all_supplier_ids_present():
    ids = {s["id"] for s in DEMO_SUPPLIERS}
    assert "SUP001" in ids
    assert "SUP002" in ids
    assert "SUP003" in ids
    assert "SUP004" in ids


def test_supplier_locations():
    loc_map = {s["id"]: s["location"] for s in DEMO_SUPPLIERS}
    assert loc_map["SUP001"] == "Mumbai, MH"
    assert loc_map["SUP002"] == "Pune, MH"
    assert loc_map["SUP003"] == "Hyderabad, TS"
    assert loc_map["SUP004"] == "Bengaluru, KA"


def test_price_bands_respected():
    """Unit price must fall within the supplier's declared price band."""
    price_base = 200.0
    for supplier in DEMO_SUPPLIERS:
        inv = get_deterministic_inventory("TESTPROD", supplier["id"], price_base)
        lo = supplier["price_band_min"] * price_base
        hi = supplier["price_band_max"] * price_base
        assert lo <= inv["rate"] <= hi, (
            f"{supplier['name']}: rate {inv['rate']} outside band [{lo}, {hi}]"
        )


def test_supplier_sku_uses_prefix():
    for supplier in DEMO_SUPPLIERS:
        inv = get_deterministic_inventory("TESTPROD", supplier["id"], 100.0)
        assert inv["supplier_sku"].startswith(supplier["id"][:3]), \
            f"SKU {inv['supplier_sku']} should start with {supplier['id'][:3]}"
