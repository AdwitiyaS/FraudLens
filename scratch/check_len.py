import json
with open("ml-models/feature_names.json") as f:
    feats = json.load(f)
print("Length of feature_names.json:", len(feats))
