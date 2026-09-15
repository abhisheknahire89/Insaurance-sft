from __future__ import annotations
import cv2, os
from pathlib import Path

def create_variants(src:str,out_dir:str)->dict[str,str]:
    img=cv2.imread(src)
    if img is None: raise ValueError('Unreadable image')
    out=Path(out_dir); out.mkdir(parents=True,exist_ok=True)
    paths={'original':src}
    # conservative enhancement: CLAHE on luminance + mild denoise/sharpen; preserve handwriting strokes.
    lab=cv2.cvtColor(img,cv2.COLOR_BGR2LAB); l,a,b=cv2.split(lab)
    l=cv2.createCLAHE(clipLimit=1.8,tileGridSize=(8,8)).apply(l)
    bal=cv2.cvtColor(cv2.merge([l,a,b]),cv2.COLOR_LAB2BGR)
    bal=cv2.fastNlMeansDenoisingColored(bal,None,3,3,7,21)
    blur=cv2.GaussianBlur(bal,(0,0),1.0); bal=cv2.addWeighted(bal,1.20,blur,-0.20,0)
    p=str(out/'balanced.jpg'); cv2.imwrite(p,bal,[int(cv2.IMWRITE_JPEG_QUALITY),95]); paths['balanced']=p
    for name,code in [('rot90',cv2.ROTATE_90_CLOCKWISE),('rot270',cv2.ROTATE_90_COUNTERCLOCKWISE)]:
        r=cv2.rotate(img,code); rp=str(out/f'{name}.jpg'); cv2.imwrite(rp,r,[int(cv2.IMWRITE_JPEG_QUALITY),95]); paths[name]=rp
    return paths
