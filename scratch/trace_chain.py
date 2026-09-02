"""Full diagnostic: trace the model-stats chain to find why it shows RF_IF"""
import os, requests
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

db = MongoClient(os.getenv("MONGO_URI"))["CapstoneProject"]

# 1. Check what's actually in MongoDB
for col_name in ["user_transactions", "transactions", "predictions"]:
    col = db[col_name]
    total = col.count_documents({})
    anon = col.count_documents({"userId": "anonymous"})
    print(f"[DB] {col_name}: total={total}, userId='anonymous'={anon}")

# 2. Check distinct userIds in user_transactions
user_ids = db["user_transactions"].distinct("userId")
print(f"\n[DB] Distinct userIds in user_transactions: {user_ids}")

# 3. Hit Flask directly (port 5001) with userId=anonymous
try:
    r = requests.get("http://127.0.0.1:5001/api/model-stats?userId=anonymous")
    d = r.json()
    print(f"\n[Flask 5001] model-stats?userId=anonymous => activeStructure={d.get('activeStructure')}, modelName={d.get('modelName')}")
except Exception as e:
    print(f"\n[Flask 5001] ERROR: {e}")

# 4. Hit Node.js (port 5000) — this is what the React app actually calls
try:
    r = requests.get("http://127.0.0.1:5000/api/model-stats")
    d = r.json()
    print(f"[Node  5000] model-stats => activeStructure={d.get('activeStructure')}, modelName={d.get('modelName')}")
except Exception as e:
    print(f"[Node  5000] ERROR: {e}")

# 5. Check what analytics says about total rows
try:
    r = requests.get("http://127.0.0.1:5000/api/stats")
    d = r.json()
    print(f"\n[Node  5000] stats => totalTransactions={d.get('totalTransactions')}, fraudsDetected={d.get('fraudsDetected')}")
except Exception as e:
    print(f"\n[Node  5000] stats ERROR: {e}")
