from __future__ import annotations
import json, os, time, mimetypes
from pathlib import Path
from typing import List, Any, Dict
from .models import OCRLine, InvoiceLine
from .parser import normalize_urgency, parse_text_block

class ProviderError(RuntimeError): pass

WANT_SLIP_SCHEMA = {
    "type": "object",
    "description": "Structured pharmacy want-slip extraction",
    "properties": {
        "items": {
            "type": "array",
            "description": "Every visible line under any group, including uncertain/crossed lines. Duplicate the group heading for each line if applicable.",
            "items": {
                "type": "object",
                "description": "One visual line from the want slip",
                "properties": {
                    "group_name": {"type": "string", "description": "Heading above the requested items; empty if absent."},
                    "raw_text": {"type": "string", "description": "Best literal reading of this handwritten line. Preserve ambiguity; do not silently normalize brands."},
                    "medicine_name": {"type": "string", "description": "Medicine or healthcare product name exactly as read. Empty for pure operator notes."},
                    "strength": {"type": "string", "description": "Explicit drug strength only (for example 500 mg); empty if absent."},
                    "variant": {"type": "string", "description": "Explicit formulation/size/pack descriptor such as syrup, gel, small; empty if absent."},
                    "quantity": {"type": "number", "description": "ORDER QUANTITY only. Use 0 if no explicit quantity is present. Do NOT treat 500ml volume, 24G needle gauge, MRP, price, pack size, or strength as order quantity."},
                    "unit": {"type": "string", "description": "Explicit order unit such as strip, box, piece, bottle, sachet, tube or pack; empty if absent."},
                    "urgency": {"type": "string", "enum": ["URGENT", "ROUTINE", "NOT_SPECIFIED"], "description": "URGENT only if urgency is explicitly written. Never infer from quantity/underlining."},
                    "line_status": {"type": "string", "enum": ["ACTIVE", "CROSSED_OUT", "UNCERTAIN", "NOTE"], "description": "ACTIVE for a live order line; CROSSED_OUT for cancelled text; NOTE for operator instructions; UNCERTAIN if unclear."},
                    "is_order_line": {"type": "boolean", "description": "True only when this line requests a product. Pure instructions such as Hindi/Devanagari operator notes are false."},
                    "quantity_role": {"type": "string", "enum": ["ORDER_QUANTITY", "PACK_OR_VOLUME", "GAUGE", "PRICE", "STRENGTH", "UNKNOWN"], "description": "Role of the main numeric token on the line; prevents pack sizes/gauges/prices becoming false quantities."},
                    "notes": {"type": "string", "description": "Visible correction, ditto, rotation, or ambiguity note. Mention ditto/inherited brand explicitly instead of guessing."}
                }
            }
        }
    }
}

INVOICE_SCHEMA = {
    "type": "object",
    "description": "Structured pharmaceutical supplier invoice/challan",
    "properties": {
        "supplier_name": {"type": "string", "description": "Supplier/distributor legal or trade name."},
        "invoice_number": {"type": "string", "description": "Invoice, bill, challan or memo number."},
        "invoice_date": {"type": "string", "description": "Invoice date as printed; preserve the visible format."},
        "customer_name": {"type": "string", "description": "Pharmacy/customer billed to or shipped to."},
        "gstin": {"type": "string", "description": "Supplier GSTIN if visible."},
        "line_items": {
            "type": "array",
            "description": "Every medicine/product line item in the invoice table.",
            "items": {
                "type": "object",
                "description": "One invoice line item",
                "properties": {
                    "raw_text": {"type": "string", "description": "Best literal product-line reading."},
                    "product_name": {"type": "string", "description": "Product/medicine name as printed."},
                    "batch": {"type": "string", "description": "Batch/lot number if printed."},
                    "expiry": {"type": "string", "description": "Expiry date/month if printed."},
                    "quantity": {"type": "number", "description": "Billed/supplied quantity, excluding free quantity."},
                    "free_quantity": {"type": "number", "description": "Free/scheme quantity, 0 if absent."},
                    "unit": {"type": "string", "description": "Pack/unit if explicit."},
                    "mrp": {"type": "number", "description": "MRP per printed pack/unit if visible."},
                    "rate": {"type": "number", "description": "Purchase/billing rate for the line if visible."},
                    "discount_percent": {"type": "number", "description": "Line discount percent; 0 if absent."},
                    "gst_percent": {"type": "number", "description": "GST tax percent for the line; 0 if absent."},
                    "line_amount": {"type": "number", "description": "Printed taxable/net/line amount associated with this line."}
                }
            }
        },
        "subtotal": {"type": "number", "description": "Printed subtotal/taxable subtotal if visible."},
        "cgst": {"type": "number", "description": "Printed CGST amount if visible."},
        "sgst": {"type": "number", "description": "Printed SGST amount if visible."},
        "igst": {"type": "number", "description": "Printed IGST amount if visible."},
        "round_off": {"type": "number", "description": "Printed round-off adjustment if visible."},
        "grand_total": {"type": "number", "description": "Final invoice grand total amount."}
    }
}


def _mime(path:str)->str:
    return mimetypes.guess_type(path)[0] or 'application/octet-stream'

def _to_dict(x):
    if hasattr(x,'model_dump'): return x.model_dump()
    if isinstance(x,dict): return x
    try:return dict(x)
    except:return json.loads(str(x))

def _leaf_conf(annotations:Any,path:list[Any],default=.50)->float:
    try:
        a=_to_dict(annotations)
        for p in path:
            if isinstance(p,int): a=a[p]
            else: a=a[p]
            a=_to_dict(a) if not isinstance(a,(str,int,float,bool,list,type(None))) else a
        if isinstance(a,dict) and a.get('confidence') is not None:
            return max(0.0,min(1.0,float(a['confidence'])))
    except: pass
    return default

class SarvamDocAI:
    name='sarvam_document_ai'
    def __init__(self,api_key:str|None=None):
        self.key=api_key or os.getenv('SARVAM_API_KEY')
        if not self.key: raise ProviderError('SARVAM_API_KEY is missing. Put it in .env and restart.')
        try:
            from sarvamai import SarvamAI
            self.client=SarvamAI(api_subscription_key=self.key)
        except Exception as e: raise ProviderError(f'Cannot initialise Sarvam SDK: {e}') from e
    def extract_schema(self,path:str,schema:dict,language='en-IN',timeout_s=180)->tuple[dict,Any]:
        try:
            with open(path,'rb') as f:
                job=self.client.doc_ai.extract(file=[(Path(path).name,f,_mime(path))],schema=json.dumps(schema),language=language,output_format='json')
            terminal={'completed','partially_completed','failed','rejected'}; start=time.time()
            while True:
                st=self.client.doc_ai.get_status(job_id=job.job_id); status=str(st.status).lower()
                if status in terminal: break
                if time.time()-start>timeout_s: raise ProviderError('Sarvam extraction timed out')
                time.sleep(2.0)
            if status not in {'completed','partially_completed'}: raise ProviderError(f'Sarvam job ended with status={status}')
            res=self.client.doc_ai.get_results(job_id=job.job_id)
            result=_to_dict(res.result if hasattr(res,'result') else res)
            annotations=getattr(res,'annotations',None)
            return result,annotations
        except ProviderError: raise
        except Exception as e: raise ProviderError(f'Sarvam extraction failed: {e}') from e
    def extract_wantslip(self,path:str,language='en-IN')->List[OCRLine]:
        result,ann=self.extract_schema(path,WANT_SLIP_SCHEMA,language)
        out=[]
        for ii,it in enumerate(result.get('items') or []):
            group=(it.get('group_name') or '').strip() or None
            raw=str(it.get('raw_text') or '').strip(); name=str(it.get('medicine_name') or '').strip()
            if not raw and not name: continue
            try:q=float(it.get('quantity')) if it.get('quantity') not in (None,'',0,'0') else None
            except:q=None
            nc=_leaf_conf(ann,['items',ii,'medicine_name'],.50)
            qc=_leaf_conf(ann,['items',ii,'quantity'],.50) if q is not None else nc
            conf=min(nc,qc) if q is not None else nc
            out.append(OCRLine(
                raw_text=raw or name,medicine_name=name or raw,quantity=q,
                unit=str(it.get('unit') or '').strip() or None,strength=str(it.get('strength') or '').strip() or None,
                variant=str(it.get('variant') or '').strip() or None,urgency=normalize_urgency(raw,str(it.get('urgency') or 'NOT_SPECIFIED')),
                source_engine=self.name,ocr_confidence=conf,group_name=group,notes=str(it.get('notes') or '').strip() or None,
                line_status=str(it.get('line_status') or 'ACTIVE').upper().strip(),is_order_line=bool(it.get('is_order_line',True)),
                quantity_role=str(it.get('quantity_role') or 'UNKNOWN').upper().strip(),
            ))
        return out
    def extract_invoice(self,path:str,language='en-IN')->dict:
        result,ann=self.extract_schema(path,INVOICE_SCHEMA,language)
        lines=[]
        for i,it in enumerate(result.get('line_items') or []):
            def num(k):
                try:return float(it.get(k)) if it.get(k) not in (None,'') else None
                except:return None
            name=str(it.get('product_name') or '').strip(); raw=str(it.get('raw_text') or name).strip()
            conf=_leaf_conf(ann,['line_items',i,'product_name'],.50)
            lines.append(InvoiceLine(raw,name,num('quantity'),num('free_quantity'),str(it.get('unit') or '').strip() or None,
                str(it.get('batch') or '').strip() or None,str(it.get('expiry') or '').strip() or None,num('mrp'),num('rate'),num('discount_percent'),num('gst_percent'),num('line_amount'),conf))
        return {'header':{k:result.get(k) for k in ['supplier_name','invoice_number','invoice_date','customer_name','gstin','subtotal','cgst','sgst','igst','round_off','grand_total']},'lines':lines}

class TesseractBaseline:
    name='tesseract_baseline'
    def extract_wantslip(self,path:str,language='en-IN')->List[OCRLine]:
        import pytesseract
        from PIL import Image,ImageOps
        img=ImageOps.autocontrast(Image.open(path).convert('L'))
        if max(img.size)<2600: img=img.resize((img.width*2,img.height*2))
        text=pytesseract.image_to_string(img,config='--psm 6')
        return parse_text_block(text,self.name,.25)


