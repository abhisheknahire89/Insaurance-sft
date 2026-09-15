import pytest
import anyio
from app.main import generate_invoice, reconcile_api

def test_invoice_uses_fulfilled_quantity():
    async def _test():
        payload = {
            'items': [{
                'master_product_id': 'PF-12345',
                'product_name': 'Pan 40',
                'quantity': 5,
                'fulfilled_quantity': 3
            }],
            'supplier_name': 'Test Supplier',
            'order_id': 'ORD-123'
        }
        inv = await generate_invoice(payload)
        assert len(inv['lines']) == 1
        assert inv['lines'][0]['quantity'] == 3
    anyio.run(_test)

def test_short_supply_reconciliation_from_generated_invoice():
    async def _test():
        order_items = [{
            'master_product_id': 'PF-12345',
            'product_name': 'Pan 40',
            'quantity': 5,
            'fulfilled_quantity': 3
        }]
        inv = await generate_invoice({'items': order_items, 'supplier_name': 'Demo Supplier', 'order_id': 'ORD-123'})
        rec = await reconcile_api({'order_items': order_items, 'invoice_lines': inv['lines']})
        
        assert rec['clean_match'] is False
        assert len(rec['rows']) == 1
        assert rec['rows'][0]['ordered_qty'] == 5
        assert rec['rows'][0]['invoiced_qty'] == 3
        assert rec['rows'][0]['quantity_status'] == 'SHORT_SUPPLY'
    anyio.run(_test)
