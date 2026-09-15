"""
demo_data.py — Deterministic demo supplier inventory.

NO random.random() calls that change between runs.
All values are derived via MD5 hash of (master_product_id + "_" + supplier_id)
so the same product + supplier always yields the same stock, price, batch, expiry.
"""

from __future__ import annotations
import hashlib
from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# 4 Demo Distributors (fixed for all orders / all want-slips)
# ---------------------------------------------------------------------------
DEMO_SUPPLIERS: list[dict] = [
    {
        "id": "SUP001",
        "name": "ABC Pharma Distributors",
        "location": "Mumbai, MH",
        "lead_time_days": 1,
        "eta_label": "Tomorrow",
        "price_band_min": 0.88,
        "price_band_max": 0.94,
        "unavail_pct": 5,
        "profile_label": "Broad coverage · Medium pricing · 1-day delivery",
    },
    {
        "id": "SUP002",
        "name": "MedPlus Distribution",
        "location": "Pune, MH",
        "lead_time_days": 0,
        "eta_label": "Today",
        "price_band_min": 0.85,
        "price_band_max": 0.92,
        "unavail_pct": 20,
        "profile_label": "Competitive pricing · Same-day delivery · Medium coverage",
    },
    {
        "id": "SUP003",
        "name": "City Pharma Wholesale",
        "location": "Hyderabad, TS",
        "lead_time_days": 1,
        "eta_label": "Tomorrow",
        "price_band_min": 0.90,
        "price_band_max": 0.96,
        "unavail_pct": 8,
        "profile_label": "Wide range · Premium pricing · 1-2 day delivery",
    },
    {
        "id": "SUP004",
        "name": "HealthBridge Distributors",
        "location": "Bengaluru, KA",
        "lead_time_days": 2,
        "eta_label": "In 2 days",
        "price_band_min": 0.84,
        "price_band_max": 0.91,
        "unavail_pct": 30,
        "profile_label": "Value pricing · Lower coverage · 2-day delivery",
    },
]

_STOCK_POOL = [0, 4, 8, 15, 20, 27, 50, 52, 80, 100, 150, 200, 300, 500]


def _md5_int(seed_str: str) -> int:
    return int(hashlib.md5(seed_str.encode()).hexdigest(), 16)


def get_deterministic_inventory(
    master_product_id: str,
    supplier_id: str,
    price_base: float,
) -> dict:
    seed_str = f"{master_product_id}_{supplier_id}"
    h = _md5_int(seed_str)

    supplier = next(
        (s for s in DEMO_SUPPLIERS if s["id"] == supplier_id), DEMO_SUPPLIERS[0]
    )

    # Stock
    if (h % 100) < supplier["unavail_pct"]:
        stock = 0
    else:
        pool_idx = (h >> 8) % len(_STOCK_POOL)
        stock = _STOCK_POOL[pool_idx]
        if stock == 0:
            stock = _STOCK_POOL[1]

    # Pricing
    if not price_base or price_base <= 0:
        price_base = 50.0 + (h % 450)

    lo, hi = supplier["price_band_min"], supplier["price_band_max"]
    price_pct = lo + ((h >> 16) % 1000) / 1000.0 * (hi - lo)
    unit_price = round(price_base * price_pct, 2)
    mrp = round(price_base * (1.0 + ((h >> 24) % 200) / 1000.0), 2)

    # Batch + Expiry
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    b_letter1 = letters[(h >> 4) % 26]
    b_num = 100 + (h >> 12) % 900
    b_letter2 = letters[(h >> 20) % 26]
    batch_number = f"{b_letter1}{b_num}{b_letter2}"

    base_date = datetime(2026, 9, 15)
    months_add = 12 + (h >> 32) % 25
    expiry = (base_date + timedelta(days=30 * months_add)).strftime("%b %Y").upper()

    gst_rate = 12 if (h % 3) != 0 else 18

    prefix = supplier_id[:3]
    sku_num = 10000 + (h % 90000)
    supplier_sku = f"{prefix}-{sku_num}"

    return {
        "supplier_id": supplier_id,
        "supplier_name": supplier["name"],
        "location": supplier["location"],
        "supplier_sku": supplier_sku,
        "batch_number": batch_number,
        "expiry_date": expiry,
        "stock": stock,
        "mrp": mrp,
        "rate": unit_price,
        "gst_rate": gst_rate,
        "is_available": stock > 0,
        "lead_time_days": supplier["lead_time_days"],
        "eta_label": supplier["eta_label"],
    }
