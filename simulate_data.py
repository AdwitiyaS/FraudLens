import requests
import random
import time
from datetime import datetime

URL = "http://localhost:5000/api/webhook"

def generate_transaction(force_fraud=False):
    if force_fraud:
        # 🔥 Realistic Fraud Pattern
        return {
            "amount": round(random.uniform(5000, 20000), 2),
            "distance_from_home": round(random.uniform(200, 1500), 2),
            "online_order": 1
        }
    else:
        # ✅ Normal Behavior
        return {
            "amount": round(random.uniform(10, 300), 2),
            "distance_from_home": round(random.uniform(1, 30), 2),
            "online_order": random.choice([0, 1])
        }

def simulate():
    print("🚀 Starting Fraud Simulation...")
    counter = 1

    while True:  # Continuous simulation
        # Every 5th transaction OR random spike
        force_fraud = (counter % 5 == 0)

        transaction = generate_transaction(force_fraud)

        if force_fraud:
            print(f"[{counter}] 🚨 FORCED FRAUD | Amount: ${transaction['amount']}")
        else:
            print(f"[{counter}] ✅ Normal | Amount: ${transaction['amount']}")

        try:
            response = requests.post(URL, json=transaction)
            print("   ↳ Status:", response.status_code, "| Response:", response.json())
        except Exception as e:
            print("   ❌ Error connecting to Node.js:", e)

        counter += 1
        time.sleep(2)  # 2-second delay

if __name__ == "__main__":
    simulate()