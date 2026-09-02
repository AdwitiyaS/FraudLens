import pandas as pd
import requests
import os
import time

API_URL = "http://localhost:5001/api/upload-dataset"

def test_switch():
    print("--- Testing Dynamic Model Switching ---")
    
    # 1. Small Dataset (< 200k)
    print("\n[1/2] Testing Small Dataset (100 rows)...")
    df_small = pd.DataFrame({
        'Time': range(100),
        'Amount': [100.0] * 100,
        'V1': [0.1] * 100,
        'V14': [0.5] * 100
    })
    df_small.to_csv("small_test.csv", index=False)
    
    with open("small_test.csv", "rb") as f:
        r = requests.post(API_URL, files={'file': f}, data={'userId': 'test_user'})
        print("Response:", r.json())
        if "Random Forest" in r.json().get('engine', ''):
            print("SUCCESS: RF+IF selected for small dataset.")
        else:
            print("FAILURE: Wrong engine selected.")

    # 2. Large Dataset (>= 200k)
    print("\n[2/2] Testing Large Dataset (200,005 rows)...")
    df_large = pd.DataFrame({
        'Time': range(200005),
        'Amount': [100.0] * 200005
    })
    df_large.to_csv("large_test.csv", index=False)
    
    with open("large_test.csv", "rb") as f:
        r = requests.post(API_URL, files={'file': f}, data={'userId': 'test_user'})
        print("Response:", r.json())
        if "XGBoost" in r.json().get('engine', ''):
            print("SUCCESS: XGB+OCSVM selected for large dataset.")
        else:
            print("FAILURE: Wrong engine selected.")

    # Cleanup
    os.remove("small_test.csv")
    os.remove("large_test.csv")

if __name__ == "__main__":
    test_switch()
