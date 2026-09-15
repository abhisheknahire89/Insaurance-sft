from __future__ import annotations
import csv,io,json,os,shutil,uuid
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI,UploadFile,File,Form,HTTPException
from fastapi.responses import HTMLResponse,JSONResponse
from fastapi.staticfiles import StaticFiles

from .service import process_wantslip, process_text_requirement, supplier_options_demo, compare_suppliers
from .catalog import load_catalog
from .normalize import norm_text
from .demo_data import get_deterministic_inventory
from .reconcile import reconcile
from .models import InvoiceLine

from contextlib import asynccontextmanager
import time, hashlib
from .lexicon import CatalogIndex

BASE=Path(__file__).resolve().parents[1]; load_dotenv(BASE/'.env')
import tempfile
DATA=BASE/'data'; RUNTIME=Path(tempfile.gettempdir())/'.runtime'; RUNTIME.mkdir(exist_ok=True)

import asyncio

async def load_catalog_bg(app: FastAPI, cat_path: Path):
    try:
        start_time = time.time()
        catalog = await asyncio.to_thread(load_catalog, str(cat_path))
        idx = await asyncio.to_thread(CatalogIndex, catalog)
        build_time = int((time.time() - start_time) * 1000)
        
        active = sum(1 for c in catalog if not c.is_discontinued)
        discontinued = len(catalog) - active
        
        app.state.catalog = catalog
        app.state.catalog_index = idx
        app.state.catalog_status = {
            'loaded': True,
            'loading': False,
            'source': f'data/medicine_master.csv',
            'rows': len(catalog),
            'active': active,
            'discontinued': discontinued,
            'index_ready': True,
            'build_time_ms': build_time,
            'catalog_version': hashlib.md5(cat_path.read_bytes()).hexdigest()[:8],
            'last_loaded_at': time.time()
        }
        
        print("Medicine master loaded")
        print(f"Rows: {len(catalog)}")
        print("Resolver: READY")
    except Exception as e:
        app.state.catalog_status = {'loaded': False, 'loading': False, 'error': str(e)}
        print(f"Failed to load catalog: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.catalog_status = {'loaded': False, 'loading': True}
    app.state.catalog = []
    app.state.catalog_index = None
    
    cat_path = DATA/'medicine_master.csv'
    if not cat_path.exists():
        app.state.catalog_status = {'loaded': False, 'loading': False, 'error': 'NOT_FOUND'}
        print("MEDICINE MASTER NOT FOUND. Starting anyway.")
        yield
        return
        
    asyncio.create_task(load_catalog_bg(app, cat_path))
    yield

app=FastAPI(title='PharmaFlow AI Demo',version='1.0.0',lifespan=lifespan)
app.mount('/static',StaticFiles(directory=str(BASE/'static')),name='static')
app.mount('/samples',StaticFiles(directory=str(BASE/'samples')),name='samples')

def save_upload(file:UploadFile,allowed:set[str])->Path:
    ext=Path(file.filename or 'upload').suffix.lower()
    if ext not in allowed: raise HTTPException(400,f'Allowed types: {sorted(allowed)}')
    job=RUNTIME/uuid.uuid4().hex; job.mkdir(parents=True,exist_ok=True); p=job/f'input{ext}'
    with open(p,'wb') as f: shutil.copyfileobj(file.file,f)
    return p

@app.get('/',response_class=HTMLResponse)
def home(): return (BASE/'static'/'index.html').read_text(encoding='utf-8')

@app.get('/api/health')
def health():
    return {'ok':True,'sarvam_key_configured':bool(os.getenv('SARVAM_API_KEY'))}

@app.get('/api/catalog/status')
def catalog_status():
    return app.state.catalog_status

@app.get('/api/warmup')
async def warmup():
    while app.state.catalog_status.get('loading'):
        await asyncio.sleep(0.5)
    if app.state.catalog_status.get('loaded'):
        return {'ready': True, 'rows': app.state.catalog_status['rows']}
    raise HTTPException(503, "Failed to load catalog")

@app.post('/api/wantslip')
async def wantslip(file:UploadFile=File(...),language:str=Form('en-IN'),accuracy_mode:str=Form('maximum')):
    if not app.state.catalog_status.get('loaded'): raise HTTPException(503, "MEDICINE_MASTER_NOT_LOADED")
    p=save_upload(file,{'.png','.jpg','.jpeg'})
    try:return JSONResponse(process_wantslip(str(p),app.state.catalog,app.state.catalog_index,None,language,accuracy_mode,str(p.parent),None))
    except Exception as e: raise HTTPException(500,str(e))

@app.post('/api/text-requirement')
async def text_requirement(text:str=Form(...)):
    if not app.state.catalog_status.get('loaded'): raise HTTPException(503, "MEDICINE_MASTER_NOT_LOADED")
    return JSONResponse(process_text_requirement(text,app.state.catalog,app.state.catalog_index,None))

@app.get('/api/suppliers')
def suppliers(master_product_id:str,quantity:float=1):
    opts=supplier_options_demo(master_product_id,quantity)
    return {'options':opts}

@app.post('/api/suppliers/compare')
async def suppliers_compare(payload: dict):
    """
    Whole-order supplier comparison.
    Payload: { "items": [{"master_product_id": "...", "product_name": "...", "quantity": 15}] }
    Returns all 4 suppliers ranked by coverage, ETA, then price.
    """
    items = payload.get('items', [])
    if not items:
        raise HTTPException(400, "No items provided")
    return compare_suppliers(items)

@app.post('/api/invoice/generate')
async def generate_invoice(payload:dict):
    """Generates an invoice deterministically for the given order items based on demo inventory."""
    items = payload.get('items', [])
    supplier = payload.get('supplier_name', 'Demo Supplier')
    order_id = payload.get('order_id', 'PF-DEMO-001')
    
    inv_id = f"INV-{supplier[:3].upper()}-{order_id.split('-')[-1]}"
    
    invoice_lines = []
    total_taxable = 0.0
    total_tax = 0.0
    total_amount = 0.0
    
    for i, item in enumerate(items):
        mid = item.get('master_product_id')
        name = item.get('product_name')
        qty = float(item.get('fulfilled_quantity', item.get('quantity', 0)))
        
        if qty <= 0:
            continue
            
        inv_data = get_deterministic_inventory(mid, supplier, 150.0)
        
        rate = inv_data['rate']
        gst = inv_data['gst_rate']
        
        gross = rate * qty
        discount = 0.0
        taxable = gross - discount
        tax_amt = taxable * (gst / 100.0)
        line_tot = taxable + tax_amt
        
        total_taxable += taxable
        total_tax += tax_amt
        total_amount += line_tot
        
        invoice_lines.append({
            "line_number": i + 1,
            "product_name": name,
            "master_product_id": mid,
            "supplier_sku": inv_data['supplier_sku'],
            "batch": [inv_data['batch_number']],
            "expiry": inv_data['expiry_date'],
            "quantity": qty,
            "free_quantity": 0,
            "mrp": inv_data['mrp'],
            "rate": rate,
            "discount": discount,
            "gst_rate": gst,
            "taxable_value": round(taxable, 2),
            "tax_amount": round(tax_amt, 2),
            "line_total": round(line_tot, 2)
        })
        
    return {
        "invoice_id": inv_id,
        "date": time.strftime("%Y-%m-%d"),
        "supplier": supplier,
        "order_id": order_id,
        "lines": invoice_lines,
        "total_taxable": round(total_taxable, 2),
        "total_tax": round(total_tax, 2),
        "grand_total": round(total_amount, 2)
    }

@app.post('/api/reconcile')
async def reconcile_api(payload:dict):
    order_items = payload.get('order_items', [])
    invoice_lines = payload.get('invoice_lines', [])
    
    inv_objs = []
    for line in invoice_lines:
        inv_objs.append(InvoiceLine(
            raw_text=line.get('product_name', ''),
            product_name=line.get('product_name', ''),
            quantity=line.get('quantity'),
            free_quantity=line.get('free_quantity'),
            batch=line.get('batch')[0] if line.get('batch') else None,
            expiry=line.get('expiry'),
            mrp=line.get('mrp'),
            rate=line.get('rate'),
            discount_percent=0.0,
            gst_percent=line.get('gst_rate'),
            line_amount=line.get('line_total'),
            resolved_master_product_id=line.get('master_product_id'),
            resolution_decision='AUTO_ACCEPT'
        ))
    
    rec = reconcile({'payload': {'items': order_items}}, {}, inv_objs)
    return rec

