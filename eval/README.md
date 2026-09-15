# Evaluation rule

Do not quote synthetic fuzzy-matching accuracy as real want-slip OCR accuracy.

For a real pilot, freeze a manually verified line-level gold set and report at least:
- order-line recall
- false order-line rate
- exact SKU Top-1
- SKU Top-3 candidate recall
- exact quantity accuracy
- exact SKU + quantity accuracy
- LASA/ambiguity detection
- NO_MATCH precision/recall
- straight-through processing rate
- human review rate
- unsafe auto-accept rate

The three supplied want-slip images are included under `samples/wantslips/` but this package does not pretend to contain a verified 98-line gold transcription that was not provided to this runtime.
