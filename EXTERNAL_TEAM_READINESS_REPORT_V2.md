# EXTERNAL-TEAM READINESS AUDIT REPORT (V2 — RECONCILED)
**PharmaFlow AI — End-to-End Correctness & Verification Audit**
**Date**: September 21, 2026
**Verdict**: `TEAM_TEST_READY`

---

## 1. Corrections from V1 Audit

This V2 report reconciles and corrects all internal contradictions identified in the V1 audit report. Below is an explicit record of the corrections:

1. **Rosuvastatin Catalogue Correction**:
   - *V1 Error*: Listed `Rosuvastatin 20mg` as an out-of-catalogue product returning `NO_MATCH`.
   - *Investigation*: Runtime catalogue (`data/medicine_master_demo.csv`, SHA-256 `fdc454b9...`, 84 rows) contains `SKU0056` (`Rosuvastatin 20`, tablet, strength `20 mg`).
   - *Resolution*: Query `"Rosuvastatin 20mg"` accurately targets `SKU0056` (confidence score `0.8506`). Replaced `Rosuvastatin 20mg` in out-of-catalogue testing with `Empagliflozin 10mg` (objectively absent from all 84 master rows). All 20 absent products in the updated test set return clean `NO_MATCH` with `master_product_id = null`.
2. **Denominator & Terminology Correction**:
   - *V1 Error*: Ambiguously called only the 5 catalogue-covered lines "visible order lines", creating a denominator mismatch (`5 + 18 + 61 = 84`).
   - *Correction*: Terminology updated to **Product / Order Lines** (`23` lines) vs. **Non-Order / Header / Note Lines** (`61` lines). Total line records = `84`. All percentages recalculated using explicit denominators.
3. **OCR Metric Correction**:
   - *V1 Error*: Claimed 100% OCR accuracy based on only 5 catalogue-covered lines.
   - *Correction*: Evaluated raw OCR transcription across **all 23 product lines**: Exact transcription = `21/23` (91.3%), Normalized transcription = `23/23` (100.0%). OCR transcription accuracy is explicitly separated from catalogue coverage.
4. **10's Quantity-Role Correction**:
   - *V1 Error*: Bare `10's` notation was parsed as `ORDER_QUANTITY = 10`.
   - *Correction*: Updated `app/parser.py` to distinguish `PACK_SIZE` from `ORDER_QUANTITY`. Bare `10's` returns `quantity = None` and `quantity_role = 'PACK_SIZE'`. Explicit order multipliers (`x10`, `qty 10`, `10 strips`) continue to return `quantity = 10.0`.
5. **AUTO_ACCEPT Interpretation Correction**:
   - *V1 Error*: Reported 5/5 matched SKUs without explicitly clarifying their routing status.
   - *Correction*: Clarified that all 5 covered lines were routed to `REVIEW` for human confirmation. `AUTO_ACCEPT count` = `0`, `AUTO_ACCEPT correct` = `0/0`, `Top-1 candidate correct` = `5/5` (100.0%).
6. **Safety Language & Scope Limitations**:
   - Replaced "Safety Guarantee" with `"0 unsafe AUTO_ACCEPTs observed in the tested sample"`.
   - Added explicit limitation stating that real-world OCR accuracy across diverse unseen handwriting cannot be established from 3 slips alone.

---

## 2. Master Catalogue Runtime Evidence

- **Active Catalogue File**: `data/medicine_master_demo.csv`
- **File SHA-256 Hash**: `fdc454b9ca38d9e5b103795ac1c54eee7cf58f53231b82cb06ef5be97a1c98d2`
- **Row Count**: `84` rows (`SKU0001` through `SKU0084`)
- **SKU0056 Verification**:
  - `master_product_id`: `SKU0056`
  - `product_name`: `Rosuvastatin 20`
  - `strength`: `20 mg`
  - `form`: `tablet`
  - `aliases`: `Rosuvas20`
- **Query Resolution**:
  - `"Rosuvastatin 20mg"` -> `decision: REVIEW`, `candidate_master_product_id: SKU0056`, `score: 0.8506` (name score `0.9199`, strength score `1.0`)
  - `"Rosuvastatin 20"` -> `decision: REVIEW`, `candidate_master_product_id: SKU0056`, `score: 0.9959` (name score `1.0`, strength score `1.0`)

---

## 3. Real Want-Slip Test Metrics (Reconciled)

Tested against all 3 real want-slip image samples (`WANT_SLIP_001.png`, `WANT_SLIP_002.png`, `WANT_SLIP_003.png`).

| Category | Metric | Count / Value | Percentage / Note |
| :--- | :--- | :--- | :--- |
| **Total Extracted Lines** | Line records extracted | **84** | 100.0% of OCR detections |
| **Product / Order Lines** | Lines with medicine/product requirement | **23** | 27.4% of total lines |
| **Non-Order / Header / Note Lines** | Store headers, dates, signatures | **61** | 72.6% of total lines |
| **OCR Raw Exact Match** | Visually identical raw OCR text | **21 / 23** | 91.3% (exact string match) |
| **OCR Raw Normalized Match** | Whitespace/case normalized OCR match | **23 / 23** | 100.0% (normalized text) |
| **Catalogue Coverage** | Product lines present in 84-SKU master | **5 / 23** | 21.7% of product lines |
| **Not-In-Catalogue Product Lines** | Product lines absent from 84-SKU master | **18 / 23** | 78.3% of product lines |
| **Top-1 Resolver Accuracy** | Correct candidate among covered lines | **5 / 5** | 100.0% (Dolo 650, Pan 40, Allegra 120, etc.) |
| **AUTO_ACCEPT Count** | Lines auto-committed without review | **0** | 0.0% |
| **Unsafe AUTO_ACCEPT Count** | Incorrect or low-confidence lines auto-accepted | **0** | **0 unsafe AUTO_ACCEPTs observed** |
| **REVIEW Routing Count** | Lines routed for human review | **23** | 5 catalogue-covered + 18 out-of-catalogue |

> [!NOTE]
> **Sample Size Limitation**: Real-world OCR accuracy across diverse handwriting cannot be fully established from 3 slips. Controlled external team testing is intended to expand unseen handwriting coverage.

---

## 4. Quantity Safety & Role Distinction

Tested parser quantity extraction rules in `app/parser.py`:

| Input Test String | Parsed Quantity | Unit | Quantity Role | Expected Safety Outcome | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `"Dolo 650 10's"` | `None` | `None` | `PACK_SIZE` | Pack size notation; NOT order quantity | **PASS** |
| `"Dolo 650 x10"` | `10.0` | `None` | `EXPLICIT_MULTIPLIER` | Explicit multiplier | **PASS** |
| `"Dolo 650 qty 10"` | `10.0` | `None` | `EXPLICIT_QTY_LABEL` | Explicit quantity label | **PASS** |
| `"Dolo 650 10 strips"` | `10.0` | `strip` | `NUMBER_WITH_ORDER_UNIT` | Number with order unit | **PASS** |
| `"650 mg"` | `None` | `None` | `STRENGTH_OR_VOLUME` | Strength ignored as quantity | **PASS** |
| `"500 ml"` | `None` | `None` | `STRENGTH_OR_VOLUME` | Liquid volume ignored as quantity | **PASS** |
| `"24G"` | `None` | `None` | `GAUGE` | Needle gauge ignored as quantity | **PASS** |
| `"MRP 62"` | `None` | `None` | `PRICE` | Maximum retail price ignored as quantity | **PASS** |

---

## 5. Out-of-Catalogue Safety Test (20 Objectively Absent Products)

20 realistic pharmaceutical products verified to be **objectively absent** from all 84 rows of `data/medicine_master_demo.csv`:

*Atorvastatin 80mg, Levothyroxine 100mcg, Amoxicillin 250mg, Lisinopril 10mg, Losartan 50mg, Omeprazole 20mg, Simvastatin 40mg, Metoprolol 50mg, Amlodipine 5mg, Hydrochlorothiazide 25mg, Gabapentin 300mg, Sertraline 50mg, Azithromycin 250mg, Ciprofloxacin 500mg, Duloxetine 30mg, Prednisone 10mg, Fluoxetine 20mg, Tramadol 50mg, Montelukast 10mg, Empagliflozin 10mg*.

- **`NO_MATCH` Decision Count**: **20 / 20** (100.0%)
- **`master_product_id` set to `None`**: **20 / 20** (100.0%)
- **Nearest-Neighbour SKU Leakage**: **0**

---

## 6. Known 84-SKU Target Matches

Verified canonical resolver mapping for key standard drug queries:

| Query String | Target SKU | Result SKU | Decision | Outcome |
| :--- | :--- | :--- | :--- | :--- |
| `Dolo 650` | `SKU0001` | `SKU0001` | `REVIEW` | **PASS** |
| `Dolo 500` | `SKU0002` | `SKU0002` | `REVIEW` | **PASS** |
| `Pan 40` | `SKU0005` | `SKU0005` | `REVIEW` | **PASS** |
| `Pantop 40` | `SKU0007` | `SKU0007` | `REVIEW` | **PASS** |
| `Allegra 120` | `SKU0009` | `SKU0009` | `REVIEW` | **PASS** |
| `Azithral 500` | `SKU0011` | `SKU0011` | `REVIEW` | **PASS** |
| `Crocin 500` | `SKU0038` | `SKU0038` | `REVIEW` | **PASS** |
| `U Wash small` | `SKU0022` | `SKU0022` | `REVIEW` | **PASS** |
| `Iodi Fresh` | `SKU0024` | `SKU0024` | `REVIEW` | **PASS** |
| `Statfree135` | `SKU0032` | `SKU0032` | `REVIEW` | **PASS** |
| `ENO fruit salt` | `SKU0084` | `SKU0084` | `REVIEW` | **PASS** |

---

## 7. Master-ID Integrity, Determinism & Supplier Math

1. **Master-ID Validation**: `GET /api/suppliers` validates `product_ids` against active master catalogue. Valid ID (`SKU0001`) returns `HTTP 200 OK`. Invalid IDs (`MP001`, `ABC123`, `SKU9999`, `""`, `null`) return `HTTP 400 Bad Request` (`detail: PRODUCT_NOT_IN_CATALOGUE`).
2. **Determinism**: 10 repeated queries across browser reloads and server restarts returned 100% identical stock, price, ETA, and supplier SKUs.
3. **Supplier Math & Ranking**:
   - `line_total = unit_price × fulfillable_qty` verified.
   - Ranking key order verified: **1. Full coverage count (`full_line_count` desc)** -> **2. Earliest ETA (`eta_date` asc)** -> **3. Lowest total cost (`estimated_total` asc)**.

---

## 8. Order-Invoice Integrity & Short-Supply

- **Requested Order Quantity**: `5` units
- **Supplier Fulfillment Capability**: `3` units
- **Order Snapshot**: Preserves `5` requested units.
- **Supplier Fulfillment Record**: Stores `3` fulfilled units.
- **Tax Invoice Generated**: Billed for `3` fulfilled units (`line_total = unit_price × 3`).
- **Reconciliation Status**: `SHORT_SUPPLY`
- **UI Warning Display**: `"Short by 2"` displayed correctly.

---

## 9. Architecture & Clean Start Clarification

- **Demo Runtime Architecture**: Runtime transaction state is held in **browser localStorage / memory** and temporary cache files in `.runtime/`. SQLite is not used for demo transaction state.
- **Clean Start Execution**: Clean start path consists of restarting the server process, clearing browser localStorage / memory, and clearing `.runtime` temporary cache files. Flow verified end-to-end without manual intervention.

---

## 10. Sabotage Audit Verification

Verified that intentional breaking of critical logic components causes test failures:

| Sabotaged Component | Injected Defect | Audit Test Result | Restoration Result |
| :--- | :--- | :--- | :--- |
| **NO_MATCH Gate** | Forced lowest score to match `SKU0001` | **RED** (`test_absent_products_return_no_match` failed) | **GREEN** |
| **Quantity Guard** | Interpreted `mg` as order quantity | **RED** (`test_parser_mg_not_qty` failed) | **GREEN** |
| **Supplier Ranking** | Reversed ETA sorting logic | **RED** (`test_supplier_ranking` failed) | **GREEN** |
| **Invoice Calculation**| Used requested instead of fulfilled qty | **RED** (`test_invoice_fulfillment_math` failed) | **GREEN** |
| **Ready Guard** | Returned `isReady = true` with unresolved lines | **RED** (`test_ready_blocker_guard` failed) | **GREEN** |

---

## 11. Final Reconciled Scorecard

```
Full pytest:                   58/58 passed (0.88s)
Real slips tested:             3
Total extracted lines:         84
Product / order lines:         23
Non-order / header / note:     61
OCR exact match:               21/23 (91.3%)
OCR normalized match:          23/23 (100.0%)
Quantity correct:              5/5 (where order quantity visibly present)
Catalogue coverage:            5/23 (21.7%)
Top-1 candidate (covered):     5/5 (100.0%)
AUTO_ACCEPT count:             0
Correct AUTO_ACCEPT:           0/0
Unsafe AUTO_ACCEPT:            0 (0 unsafe AUTO_ACCEPTs observed)
REVIEW count:                  23 (5 covered + 18 out-of-catalogue)
NOT_IN_CATALOGUE count:        18
Supplier deterministic:        PASS
Supplier recommendation:       PASS
Order → invoice:               PASS
Browser console:               PASS
End-to-end clean start:        PASS
```

## Final Audit Verdict
`TEAM_TEST_READY`
