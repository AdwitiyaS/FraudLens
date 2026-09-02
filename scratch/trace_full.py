"""
Trace the EXACT userId that flows through each layer.
This will reveal the mismatch.
"""
import os, requests
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

db = MongoClient(os.getenv("MONGO_URI"))["CapstoneProject"]

print("=" * 60)
print("LAYER 1: MongoDB — what userIds exist?")
print("=" * 60)

for col_name in ["user_transactions", "upload_metadata"]:
    col = db[col_name]
    ids = col.distinct("userId")
    total = col.count_documents({})
    print(f"  {col_name}: total={total}, distinct userIds={ids}")
    # Show a sample doc
    sample = col.find_one()
    if sample:
        sample.pop("_id", None)
        print(f"    sample: {sample}")

print()
print("=" * 60)
print("LAYER 2: Flask (port 5001) — direct call with userId=anonymous")
print("=" * 60)
try:
    r = requests.get("http://127.0.0.1:5001/api/model-stats?userId=anonymous")
    print(f"  Status: {r.status_code}")
    print(f"  activeStructure: {r.json().get('activeStructure')}")
except Exception as e:
    print(f"  ERROR: {e}")

print()
print("=" * 60)
print("LAYER 3: Node.js (port 5000) — call WITHOUT session (like React does)")
print("=" * 60)
try:
    # This simulates what React does via Vite proxy
    r = requests.get("http://127.0.0.1:5000/api/model-stats")
    print(f"  Status: {r.status_code}")
    d = r.json()
    print(f"  activeStructure: {d.get('activeStructure')}")
    print(f"  modelName: {d.get('modelName')}")
except Exception as e:
    print(f"  ERROR: {e}")

print()
print("=" * 60)
print("LAYER 4: Node.js (port 5000) — call WITH userId query param")
print("=" * 60)
try:
    r = requests.get("http://127.0.0.1:5000/api/model-stats?userId=anonymous")
    print(f"  Status: {r.status_code}")
    d = r.json()
    print(f"  activeStructure: {d.get('activeStructure')}")
except Exception as e:
    print(f"  ERROR: {e}")

print()
print("=" * 60)
print("DIAGNOSIS")
print("=" * 60)
# Check the upload_metadata for ALL userIds
metas = list(db["upload_metadata"].find())
if not metas:
    print("  ❌ upload_metadata is EMPTY — no uploads recorded yet!")
    print("     The user needs to re-upload after the latest code change.")
else:
    for m in metas:
        print(f"  userId={m.get('userId')}, structure={m.get('structure')}, rows={m.get('totalRows')}")
