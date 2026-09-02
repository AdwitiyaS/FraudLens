import requests
try:
    r = requests.get("http://127.0.0.1:5000/api/model-stats?userId=anonymous")
    print("Response Status:", r.status_code)
    print("Response Data:", r.json())
except Exception as e:
    print("Error:", e)
