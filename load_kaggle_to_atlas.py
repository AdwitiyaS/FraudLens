import pandas as pd
from pymongo import MongoClient, InsertOne
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
import time

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise Exception("MONGO_URI not found in .env file!")

print("Connecting to MongoDB Atlas...")
client = MongoClient(MONGO_URI)
db = client["fraud_platform"]
col = db["transactions"]

# Drop old local data
print("Clearing old transactions collection...")
col.drop()

print("Loading creditcard.csv...")
df = pd.read_csv("data/creditcard.csv")
print(f"Loaded {len(df):,} transactions")

# Rename Class to is_fraud for consistency with your app.py
df.rename(columns={"Class": "is_fraud"}, inplace=True)

# Add metadata columns
df["source"] = "kaggle_creditcard"
df["loaded_at"] = datetime.now(timezone.utc)

# Convert to list of dicts
records = df.to_dict(orient="records")

# Bulk insert in batches of 5000 (faster + avoids timeout)
BATCH_SIZE = 5000
total = len(records)
inserted = 0

print(f"\nUploading {total:,} records to Atlas in batches of {BATCH_SIZE}...")
start = time.time()

for i in range(0, total, BATCH_SIZE):
    batch = records[i:i+BATCH_SIZE]
    operations = [InsertOne(doc) for doc in batch]
    col.bulk_write(operations, ordered=False)
    inserted += len(batch)
    pct = (inserted / total) * 100
    elapsed = time.time() - start
    print(f"  Progress: {inserted:,}/{total:,} ({pct:.1f}%) — {elapsed:.1f}s elapsed")

# Create indexes for fast querying
print("\nCreating indexes...")
col.create_index("is_fraud")
col.create_index("Amount")
col.create_index("Time")
col.create_index([("is_fraud", 1), ("Amount", -1)])

elapsed = time.time() - start
print(f"\nDone! {inserted:,} transactions loaded in {elapsed:.1f}s")
print(f"Database: fraud_platform | Collection: transactions")
print(f"Atlas cluster: neuralguard.tv5jho7.mongodb.net")

# Quick verification
total_docs = col.count_documents({})
fraud_docs = col.count_documents({"is_fraud": 1})
legit_docs = col.count_documents({"is_fraud": 0})
print(f"\nVerification:")
print(f"  Total:      {total_docs:,}")
print(f"  Fraud:      {fraud_docs:,} ({fraud_docs/total_docs*100:.2f}%)")
print(f"  Legitimate: {legit_docs:,} ({legit_docs/total_docs*100:.2f}%)")