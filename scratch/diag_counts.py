import requests
r1 = requests.get("http://127.0.0.1:5000/api/analytics?userId=anonymous")
print("Analytics Total Rows:", r1.json().get('totalRows'))

r2 = requests.get("http://127.0.0.1:5000/api/model-stats?userId=anonymous")
print("Model Stats Structure:", r2.json().get('activeStructure'))
