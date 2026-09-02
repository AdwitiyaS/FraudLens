import pandas as pd
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

# Load env
load_dotenv()

# Connect to MongoDB Atlas
print("Connecting to MongoDB Atlas...")
client = MongoClient(os.getenv("MONGO_URI"))
db = client["fraud_platform"]
col = db["transactions"]

# Clear old data
print("Clearing old collection...")
col.delete_many({})

# Load identity dataset
print("Loading identity dataset...")
id_df = pd.read_csv("data/train_identity.csv")

CHUNK_SIZE = 20000
MAX_ROWS = 150000
total_inserted = 0

print("Processing transaction dataset in chunks...")

for chunk in pd.read_csv("data/train_transaction.csv", chunksize=CHUNK_SIZE):

    if total_inserted >= MAX_ROWS:
        break

    # Merge
    merged = chunk.merge(id_df, on="TransactionID", how="left")

    #  KEEP ONLY REQUIRED COLUMNS
    cols = [
        "TransactionID",
        "TransactionDT",
        "TransactionAmt",
        "isFraud"
    ]
    merged = merged[cols].copy()

    #  FIX COLUMN NAME (MOST IMPORTANT)
    merged.rename(columns={
        "isFraud": "is_fraud",
        "TransactionAmt": "Amount",
        "TransactionDT": "Time"
    }, inplace=True)

    #  Reduce memory (helps Atlas storage)
    merged["is_fraud"] = merged["is_fraud"].astype("int8")
    merged["Amount"] = merged["Amount"].astype("float32")
    merged["Time"] = merged["Time"].astype("int32")

    # Add flags
    merged["streamed"] = False
    merged["loaded_at"] = datetime.now(timezone.utc)

    # Convert to dict
    records = merged.to_dict(orient="records")

    if records:
        col.insert_many(records)
        total_inserted += len(records)

    print(f"Inserted: {total_inserted}")

print("Upload complete!")