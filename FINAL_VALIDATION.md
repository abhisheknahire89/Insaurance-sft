# Final validation snapshot

Build: PharmaFlow AI local demo

## Re-run evidence in this build

- Python compile: PASS
- Pytest safety/functional suite: **18/18 PASS**
- API smoke: health, typed extraction, safe SKU contract, supplier selection, and order creation: PASS
- Real supplied want-slip images through plain Tesseract baseline: 45 detected text lines across 3 images, **0 auto-accepted** by the safety gate. This is not an OCR-accuracy measurement because no verified line-level gold transcription was available in this runtime; it only confirms the gate does not treat weak legacy OCR as order-ready.
- 100,001-row synthetic catalogue scalability check: trigram index built in ~0.93 s in this container; `Dolo 650` target lookup ~146 ms and returned the intended target. This is a performance/scalability check, not real medicine-matching accuracy evidence.

## Defects explicitly regression-tested

1. `Statfree 135` is not damaged by the `stat` urgency keyword.
2. Unicode multiplication signs such as `×3` are parsed as quantity.
3. `Dolo 650 ×15 strips` retains `650` as the product discriminator and quantity `15` as the order quantity.
4. `500ml` is not converted to order quantity.
5. `24G` needle gauge is not converted to order quantity.
6. Pure operator notes are not treated as product lines.
7. `Dolonex DP` cannot silently become a catalogue SKU; non-auto decisions structurally expose `sku=null`.
8. `V-Wash` cannot silently become `U-Wash`; initial-glyph/LASA conflict is blocked.
9. `Dolo` alone is not auto-resolved across multiple Dolo variants.
10. Missing quantity cannot become order-ready.
11. Two OCR views that disagree on numeric variants (`Dolo 650` vs `Dolo 500`) are not fused as one line.
12. Two OCR views with an initial-glyph conflict are marked uncertain.
13. Supplier ETA respects cutoff/working-day arithmetic rather than a static receive-date field.
14. Short supply is detected during order↔invoice reconciliation.
15. A selected supplier that cannot fulfil the requested quantity is rejected by the order API.

## Live API limitation

No Sarvam API key was available in this build environment, so live Sarvam handwriting/invoice accuracy on the supplied documents is intentionally **not claimed**. The package is wired to the current Sarvam `doc_ai.extract()` job flow and Saaras speech-to-text API. Once `SARVAM_API_KEY` is added, the supplied real images can be used as the first live benchmark.
