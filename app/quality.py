from __future__ import annotations
import cv2

def image_quality(path:str)->dict:
    img=cv2.imread(path)
    if img is None:return {'score':0,'warnings':['Unreadable image']}
    gray=cv2.cvtColor(img,cv2.COLOR_BGR2GRAY); h,w=gray.shape
    blur=float(cv2.Laplacian(gray,cv2.CV_64F).var()); mean=float(gray.mean())
    dark=float((gray<35).mean()); blown=float((gray>248).mean())
    res=min(1.0,(w*h)/(1600*1200)); sharp=min(1.0,blur/180.0); exposure=max(0.0,1-abs(mean-150)/150)
    score=.45*sharp+.30*res+.25*exposure; warnings=[]
    if blur<65:warnings.append('Image is blurry — retake closer and hold steady')
    if w*h<900000:warnings.append('Low resolution — use the original camera image')
    if dark>.20:warnings.append('Large dark area — improve lighting')
    if blown>.45:warnings.append('Highlights are overexposed — avoid glare')
    return {'score':round(score,3),'blur':round(blur,1),'width':w,'height':h,'mean_luminance':round(mean,1),'warnings':warnings}
