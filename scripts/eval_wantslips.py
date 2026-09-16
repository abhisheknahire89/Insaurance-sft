import os
import json
from pathlib import Path
import sys
import time

# Add root directory to python path
root = Path(__file__).resolve().parent.parent
sys.path.append(str(root))

from app.service import process_wantslip
from app.catalog import load_catalog
from app.lexicon import CatalogIndex
from dotenv import load_dotenv

load_dotenv(root / '.env', override=True)

def main():
    samples_dir = root / 'samples' / 'wantslips'
    eval_dir = root / 'eval'
    catalog_path = root / 'data' / 'medicine_master_demo.csv'
    inventory_path = root / 'data' / 'supplier_inventory.csv'
    
    api_key = os.getenv('SARVAM_API_KEY')
    if not api_key:
        print("Missing SARVAM_API_KEY")
        return

    print("Loading catalog...")
    t0 = time.time()
    catalog = load_catalog(str(catalog_path))
    cat_index = CatalogIndex(catalog)
    print(f"Loaded catalog and index in {time.time() - t0:.2f}s")

    results = []
    
    for slip in samples_dir.glob('*.png'):
        print(f"Processing {slip.name}...")
        try:
            res = process_wantslip(
                src=str(slip),
                catalog=catalog,
                cat_index=cat_index,
                inventory_path=str(inventory_path),
                api_key=api_key,
                accuracy_mode='fast' # using fast mode for demo/speed
            )
            out_file = eval_dir / f"{slip.stem}_eval.json"
            with open(out_file, 'w') as f:
                json.dump(res, f, indent=2)
            results.append((slip.name, res['summary']))
            print(f"Saved results to {out_file.name}")
        except Exception as e:
            print(f"Failed on {slip.name}: {e}")
            
    print("\n--- SUMMARY METRICS ---")
    for name, summary in results:
        print(f"{name}: {summary}")

if __name__ == '__main__':
    main()
