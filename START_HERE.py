from __future__ import annotations
import os,sys,subprocess,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parent
os.chdir(ROOT)

def ensure_env():
    env=ROOT/'.env'
    if not env.exists(): shutil.copy2(ROOT/'.env.example', env)
    text=env.read_text(encoding='utf-8',errors='ignore')
    if 'SARVAM_API_KEY=' not in text:
        env.write_text(text+'\nSARVAM_API_KEY=\n',encoding='utf-8')

def install():
    try:
        import fastapi,uvicorn,rapidfuzz,cv2,dotenv
        import sarvamai
        return
    except Exception:
        print('Installing required Python packages…')
        subprocess.check_call([sys.executable,'-m','pip','install','-r',str(ROOT/'requirements.txt')])

def main():
    ensure_env(); install()
    from dotenv import load_dotenv
    load_dotenv(ROOT/'.env',override=True)
    if not os.getenv('SARVAM_API_KEY'):
        print('\nSARVAM_API_KEY is empty.')
        print('1) Open .env in this folder')
        print('2) Paste: SARVAM_API_KEY=your_key_here')
        print('3) Save and run this file again\n')
        return
    print('\nPharmaFlow AI starting at http://127.0.0.1:8000')
    print('Keep this terminal open. Press Ctrl+C to stop.\n')
    subprocess.call([sys.executable,'-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8000'])
if __name__=='__main__':main()
