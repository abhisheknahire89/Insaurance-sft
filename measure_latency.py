import time
import urllib.request
import urllib.error
import subprocess
import json

print("Starting server...")
proc = subprocess.Popen(["venv/bin/uvicorn", "server:app", "--host", "127.0.0.1", "--port", "8000"])

# Wait for port to open
start = time.time()
while True:
    try:
        urllib.request.urlopen("http://127.0.0.1:8000/api/health")
        break
    except:
        time.sleep(0.1)
cold_health = time.time() - start

# Measure homepage
h_start = time.time()
urllib.request.urlopen("http://127.0.0.1:8000/")
homepage_time = time.time() - h_start

# Measure health again
h_start2 = time.time()
urllib.request.urlopen("http://127.0.0.1:8000/api/health")
health_time = time.time() - h_start2

# Wait for catalog
while True:
    try:
        r = urllib.request.urlopen("http://127.0.0.1:8000/api/catalog/status")
        j = json.loads(r.read())
        if j.get("loaded"):
            break
    except:
        pass
    time.sleep(0.5)
catalog_ready = time.time() - start

proc.terminate()
print(f"cold_health: {cold_health:.3f}s")
print(f"homepage_time: {homepage_time:.3f}s")
print(f"health_time: {health_time:.3f}s")
print(f"catalog_ready_time: {catalog_ready:.3f}s")
