import hashlib
import random
from datetime import datetime, timedelta

DEMO_SUPPLIERS = [
    {
        "id": "SUP001",
        "name": "ABC Pharma Distributors",
        "cutoff_time": "16:00",
        "lead_time_days": 1,
        "fill_rate": 1.0  # 100% available for full order demo
    },
    {
        "id": "SUP002",
        "name": "MedPlus Distribution",
        "cutoff_time": "18:00",
        "lead_time_days": 0,
        "fill_rate": 0.8  # Partial
    },
    {
        "id": "SUP003",
        "name": "City Pharma Wholesale",
        "cutoff_time": "14:00",
        "lead_time_days": 0,
        "fill_rate": 1.0  # Full but maybe different ETA/price
    },
    {
        "id": "SUP004",
        "name": "HealthBridge Distributors",
        "cutoff_time": "16:00",
        "lead_time_days": 1,
        "fill_rate": 0.8  # Partial
    }
]

def get_deterministic_inventory(master_product_id: str, supplier_id: str, price_base: float):
    """Generate deterministic inventory data for a given product and supplier."""
    seed_str = f"{master_product_id}_{supplier_id}"
    seed = int(hashlib.md5(seed_str.encode()).hexdigest(), 16)
    rng = random.Random(seed)
    
    # Batch and expiry
    batch_num = f"{rng.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{rng.randint(100, 999)}{rng.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}"
    
    # Expiry 12-36 months in future from a fixed date to keep it stable
    base_date = datetime(2026, 9, 15)
    months_add = rng.randint(12, 36)
    expiry = (base_date + timedelta(days=30 * months_add)).strftime("%b %Y").upper()
    
    # MRP and Rate
    if not price_base or price_base <= 0:
        price_base = rng.uniform(50.0, 500.0)
        
    mrp = round(price_base * rng.uniform(1.0, 1.2), 2)
    rate = round(price_base * rng.uniform(0.7, 0.9), 2)
    
    # GST rate (12% or 18%)
    gst = rng.choice([12, 18])
    
    # Availability
    supplier_info = next((s for s in DEMO_SUPPLIERS if s["id"] == supplier_id), DEMO_SUPPLIERS[0])
    is_available = rng.random() <= supplier_info["fill_rate"]
    
    # Stock
    stock = rng.randint(50, 500) if is_available else 0
    
    return {
        "supplier_id": supplier_id,
        "supplier_sku": f"SKU-{batch_num}",
        "batch_number": batch_num,
        "expiry_date": expiry,
        "stock": stock,
        "mrp": mrp,
        "rate": rate,
        "gst_rate": gst,
        "is_available": is_available
    }
