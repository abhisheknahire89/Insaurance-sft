from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Any

@dataclass
class OCRLine:
    raw_text: str
    medicine_name: str
    quantity: Optional[float] = None
    unit: Optional[str] = None
    strength: Optional[str] = None
    variant: Optional[str] = None
    urgency: str = "NOT_SPECIFIED"
    source_engine: str = "unknown"
    ocr_confidence: float = 0.0
    group_name: Optional[str] = None
    notes: Optional[str] = None
    line_status: str = "ACTIVE"
    is_order_line: bool = True
    quantity_role: str = "UNKNOWN"
    reader_votes: int = 1
    reader_agreement: float = 0.0

@dataclass
class CatalogCandidate:
    master_product_id: str
    product_name: str
    strength: str
    form: str
    manufacturer: str
    score: float
    name_score: float
    strength_score: float
    source: str = "fuzzy"
    lasa_risk: bool = False

@dataclass
class Resolution:
    decision: str
    master_product_id: Optional[str]
    product_name: Optional[str]
    confidence: float
    reason: str
    candidates: List[Dict[str, Any]] = field(default_factory=list)
    requires_review: bool = True
    candidate_master_product_id: Optional[str] = None
    candidate_product_name: Optional[str] = None

@dataclass
class SupplierOption:
    supplier: str
    supplier_sku: str
    stock: float
    price: Optional[float]
    eta: Optional[str]
    can_fulfil: bool
    partial_quantity: float = 0.0

@dataclass
class InvoiceLine:
    raw_text: str
    product_name: str
    quantity: Optional[float]
    free_quantity: Optional[float] = None
    unit: Optional[str] = None
    batch: Optional[str] = None
    expiry: Optional[str] = None
    mrp: Optional[float] = None
    rate: Optional[float] = None
    discount_percent: Optional[float] = None
    gst_percent: Optional[float] = None
    line_amount: Optional[float] = None
    ocr_confidence: float = 0.0
    resolved_master_product_id: Optional[str] = None
    resolution_decision: str = "REVIEW"


def dc(obj):
    return asdict(obj)
