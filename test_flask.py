import requests

url = "http://127.0.0.1:5001/predict"

data = {
    "amount": 500,
    "online_order": 1
}

response = requests.post(url, json=data)

print("Status Code:", response.status_code)
print("Response:", response.json())