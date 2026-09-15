from app.models import OCRLine
from app.fusion import fuse_many

def L(name,q=1,conf=.8):
    return OCRLine(name,name,q,ocr_confidence=conf)

def test_different_numeric_variants_not_fused():
    out=fuse_many([[L('Dolo 650')],[L('Dolo 500')]])
    assert len(out)==2

def test_initial_glyph_conflict_marks_uncertain():
    out=fuse_many([[L('V-Wash Small',3)],[L('U-Wash Small',3)]])
    assert len(out)==1 and out[0].line_status=='UNCERTAIN'
