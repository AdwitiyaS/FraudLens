import json

with open("ml-models/top_features.json") as f:
    top = json.load(f)
with open("ml-models/feature_names.json") as f:
    full = json.load(f)

missing = [f for f in top if f not in full]
print("Features in TOP but not in FULL:", missing)
