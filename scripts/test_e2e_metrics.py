import os, json, time, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
sys.path.append(str(root))
from app.service import process_wantslip
from app.catalog import load_catalog
from app.lexicon import CatalogIndex
from dotenv import load_dotenv

load_dotenv(root / '.env', override=True)

def main():
    samples_dir = root / 'samples' / 'wantslips'
    ground_truth_dir = root / 'eval_ground_truth'
    catalog_path = root / 'data' / 'medicine_master_demo.csv'
    
    api_key = os.getenv('SARVAM_API_KEY')
    if not api_key:
        print("Missing SARVAM_API_KEY")
        return

    print("Loading catalog...")
    t0 = time.time()
    catalog = load_catalog(str(catalog_path))
    cat_index = CatalogIndex(catalog)
    print(f"Loaded catalog and index in {time.time() - t0:.2f}s")

    total_gt_order_lines = 0
    total_pred_order_lines = 0
    
    auto_accept_count = 0
    correct_auto_accept_count = 0
    unsafe_auto_accept_count = 0
    no_match_count = 0
    review_count = 0
    
    print("\n--- Running Evaluation ---")
    
    for slip in samples_dir.glob('*.png'):
        try:
            res = process_wantslip(src=str(slip), catalog=catalog, cat_index=cat_index, api_key=api_key, accuracy_mode='fast')
            
            gt_file = ground_truth_dir / f"{slip.stem}_eval.json"
            if not gt_file.exists(): continue
                
            with open(gt_file, 'r') as f:
                gt = json.load(f)
                
            gt_items = [x for x in gt.get('items', []) if x['input'].get('is_order_line')]
            pred_items = [x for x in res.get('items', []) if x['input'].get('is_order_line')]
            
            total_gt_order_lines += len(gt_items)
            total_pred_order_lines += len(pred_items)
            
            for item in pred_items:
                dec = item['resolution']['decision']
                if dec == 'AUTO_ACCEPT': auto_accept_count += 1
                elif dec == 'NO_MATCH': no_match_count += 1
                else: review_count += 1
                
        except Exception as e:
            print(f"Failed on {slip.name}: {e}")

    print("\n========================================================")
    print("PHASE 2: REAL WANT-SLIP REGRESSION METRICS")
    print("========================================================")
    print("Ground truth corpus: 85 frozen lines across 3 slips.")
    print("Order-line detection recall:\tNOT MEASURED (requires complex bipartite matching)")
    print("Medicine-name exact accuracy:\tNOT MEASURED")
    print("Medicine normalized accuracy:\tNOT MEASURED")
    print("Quantity accuracy:\t\tNOT MEASURED")
    print("SKU Top-1:\t\t\tNOT MEASURED")
    print("SKU Top-3:\t\t\tNOT MEASURED")
    print("SKU + quantity exact accuracy:\tNOT MEASURED")
    print(f"AUTO_ACCEPT count:\t\t{auto_accept_count}")
    print(f"Correct AUTO_ACCEPT count:\tNOT MEASURED")
    print(f"Unsafe AUTO_ACCEPT count:\tNOT MEASURED")
    print(f"NO_MATCH count:\t\t\t{no_match_count}")
    print(f"REVIEW count:\t\t\t{review_count}")
    print("========================================================")

if __name__ == '__main__':
    main()
