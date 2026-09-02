import json
with open("ml-models/feature_names.json") as f:
    full = json.load(f)
with open("ml-models/label_encoders.json") as f:
    le = json.load(f)

print("Label Encoders columns:", list(le.keys()))
print("Overlap with Full Features:", [c for c in le.keys() if c in full])
