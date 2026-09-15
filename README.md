# PharmaFlow AI — final local demo

Two-sided pharmacy procurement demo:

**Pharmacy**: handwritten want slip / typed requirement → medicine + quantity extraction → catalogue/SKU resolution → safety/LASA gate → supplier stock + price + calculated ETA → confirmed order.

**Supplier**: receives structured order → confirms/dispatches → uploads normal invoice/challan → Document AI extracts product/batch/expiry/qty/rate/GST → line-level order-vs-invoice reconciliation.

## Run in Antigravity / local

1. Open this folder.
2. Open `.env` and paste your key:
   `SARVAM_API_KEY=YOUR_KEY`
3. Run:
   `python START_HERE.py`
4. Open `http://127.0.0.1:8000`

`START_HERE.py` installs missing Python dependencies automatically.

## Demo sequence

1. **Pharmacy → Handwritten want slip**: upload one of `samples/wantslips/` and keep **Maximum — 4 views** for the hardest demo.
2. Review any amber/red line. The backend never exposes a committed `sku` for non-auto decisions. Pick a candidate only when you can verify it.
3. Confirm quantity and supplier, then create the order.
4. Open **Supplier**, confirm/dispatch the order.
5. Upload one of your real invoice images/PDFs and select that order to run extraction + reconciliation.

## Accuracy architecture

- Sarvam Document AI Extract with an explicit want-slip schema.
- Multi-view OCR: original + conservative enhanced view + 90° and 270° rotations in Maximum mode, submitted in parallel.
- Numeric role separation: explicit quantity vs volume/pack, gauge, price and strength.
- Catalogue-constrained resolution with OCR-confusion weighted edit distance, fuzzy similarity, phonetic signal and trigram candidate blocking.
- Strength conflict checks and LASA guards (including V-Wash/U-Wash type initial-glyph risk).
- Explicit `NO_MATCH` and a structural rule: **if decision != AUTO_ACCEPT, sku = null**.
- Cached human corrections are used only as ranking hints, never as unconditional truth.
- Supplier ETA calculated from lead time, cutoff and working days rather than a static receive-date CSV field.
- Invoice extraction is separate from handwriting OCR and is reconciled at line/field level.

## Data files

`data/medicine_master.csv` is a demo catalogue. Replace it from **Setup & Data** for a real trial.

Required catalogue columns: `sku,product_name`. Recommended: `strength,form,manufacturer,aliases`.

`data/supplier_inventory.csv` is demo inventory. Required: `supplier,sku,stock,price`. Recommended: `lead_time_hours,cutoff_time,working_days` where weekdays are Python 0=Mon ... 6=Sun.

## Safety / limitation

This is a commercial demo candidate, not a validated autonomous procurement system. Never claim the included sample catalogue or synthetic/unit tests establish production handwriting accuracy. Real acceptance requires a verified real-slip gold set and measurement of unsafe auto-accepts, exact SKU+quantity, review rate and line recall.
