"""Test RF model predictions on a small sample of the IEEE-CIS dataset."""
import pandas as pd
import numpy as np
import joblib
import json

# Load models and config
rf = joblib.load("ml-models/random_forest_model.pkl")
threshold = joblib.load("ml-models/threshold.pkl")
scaler = joblib.load("ml-models/scaler.pkl")

with open("ml-models/feature_names.json") as f:
    FULL_FEATURES = json.load(f) + ["D3", "M4"]
with open("ml-models/label_encoders.json") as f:
    LABEL_ENCODERS = json.load(f)

print(f"RF expects {rf.n_features_in_} features")
print(f"Full features list: {len(FULL_FEATURES)} features")
print(f"Threshold: {threshold}")

# Load a small sample
df = pd.read_csv("dataset/train_transaction.csv", nrows=5000)

# Rename columns
df.rename(columns={"TransactionAmt": "Amount", "TransactionDT": "Time", "isFraud": "is_fraud"}, inplace=True)

# Encode categoricals
for col, classes in LABEL_ENCODERS.items():
    if col in df.columns:
        mapping = {str(c): i for i, c in enumerate(classes)}
        nan_idx = mapping.get('nan', 0)
        df[col] = df[col].astype(str).map(lambda x: mapping.get(x, nan_idx))

# Build feature vector
X = np.zeros((len(df), len(FULL_FEATURES)))
existing_cols = [col for col in FULL_FEATURES if col in df.columns]
col_indices = [FULL_FEATURES.index(col) for col in existing_cols]
X_df = df[existing_cols].apply(pd.to_numeric, errors='coerce').fillna(0)
X[:, col_indices] = X_df.values.astype(float)

# Scale
X_scaled = scaler.transform(X)

# Predict
probas = rf.predict_proba(X_scaled)[:, 1]
actual_frauds = df['is_fraud'].sum()

print(f"\nActual frauds in sample: {actual_frauds}")
print(f"Proba stats: min={probas.min():.6f}, max={probas.max():.6f}, mean={probas.mean():.6f}")
print(f"Frauds at threshold {threshold}: {(probas >= threshold).sum()}")
print(f"Frauds at threshold 0.5: {(probas >= 0.5).sum()}")
print(f"Frauds at threshold 0.1: {(probas >= 0.1).sum()}")
print(f"Frauds at threshold 0.01: {(probas >= 0.01).sum()}")

# Show top 10 highest proba
top_idx = np.argsort(probas)[-10:][::-1]
print(f"\nTop 10 highest probabilities:")
for i in top_idx:
    print(f"  idx={i}, proba={probas[i]:.6f}, actual_fraud={df.iloc[i]['is_fraud']}")
