from app.parser import parse_free_text_line,clean_name,normalize_urgency

def test_statfree_not_corrupted_by_stat_keyword():
    assert clean_name('Statfree 135')=='Statfree 135'
    assert normalize_urgency('Statfree 135')=='NOT_SPECIFIED'

def test_unicode_multiplication_quantity():
    for q in ['x3', 'X3', '×3', 'x 3', '× 3', '3x', '3 ×']:
        x=parse_free_text_line(f'Azrol OSR {q}')
        assert x.quantity==3, f"Failed on {q}"

def test_pack_volume_not_quantity():
    x=parse_free_text_line('DNS 500ml')
    assert x.quantity is None

def test_gauge_not_quantity():
    x=parse_free_text_line('Needle 24G')
    assert x.quantity is None

def test_mrp_not_quantity():
    x=parse_free_text_line('Dolo 650 MRP 62')
    assert x.quantity is None

def test_pack_not_quantity():
    x=parse_free_text_line('Pack of 10')
    assert x.quantity is None

def test_discount_not_quantity():
    x=parse_free_text_line('Dolo 650 5% discount')
    assert x.quantity is None

def test_price_symbol_not_quantity():
    x=parse_free_text_line('Dolo 650 ₹320')
    assert x.quantity is None

def test_unit_quantity_is_quantity():
    x=parse_free_text_line('Pan 40 5 boxes')
    assert x.quantity==5 and x.unit=='box'

def test_multiplier_quantity_does_not_eat_strength_discriminator():
    x=parse_free_text_line('Dolo 650 ×15 strips')
    assert x.medicine_name=='Dolo 650' and x.quantity==15 and x.unit=='strip'

def test_operator_note_is_not_order_line():
    x=parse_free_text_line('खाली कैप्सूल देना है')
    assert x.is_order_line is False and x.line_status=='NOTE'
