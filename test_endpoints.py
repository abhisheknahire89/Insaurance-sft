import time
import urllib.request
import urllib.error
import subprocess

proc = subprocess.Popen(["venv/bin/uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000"])
try:
    for i in range(20):
        try:
            req = urllib.request.urlopen("http://127.0.0.1:8000/api/health")
            if req.getcode() == 200:
                print("Server is up!")
                break
        except urllib.error.URLError:
            pass
        time.sleep(1)
        
    print("/", urllib.request.urlopen("http://127.0.0.1:8000/").getcode())
    print("/api/health", urllib.request.urlopen("http://127.0.0.1:8000/api/health").getcode())
    print("/api/catalog/status", urllib.request.urlopen("http://127.0.0.1:8000/api/catalog/status").getcode())
finally:
    proc.terminate()
