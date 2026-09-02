"""Find optimal RF threshold using precision-recall curve on a sample."""
import pandas as pd
import numpy as np
import joblib
import json
from sklearn.metrics import precision_recall_curve, f1_score

rf = joblib.load("ml-models/random_forest_model.pkl")
scaler = joblib.load("ml-models/scaler.pkl")
with open("ml-models/feature_names.json") as f:
    FULL_FEATURES = json.load(f) + ["D3", "M4"]
with open("ml-models/label_encoders.json") as f:
    LABEL_ENCODERS = json.load(f)

# Load larger sample for reliable threshold estimation
df = pd.read_csv("dataset/train_transaction.csv", nrows=50000)
df.rename(columns={"TransactionAmt": "Amount", "TransactionDT": "Time", "isFraud": "is_fraud"}, inplace=True)

for col, classes in LABEL_ENCODERS.items():
    if col in df.columns:
        mapping = {str(c): i for i, c in enumerate(classes)}
        nan_idx = mapping.get('nan', 0)
        df[col] = df[col].astype(str).map(lambda x: mapping.get(x, nan_idx))

X = np.zeros((len(df), len(FULL_FEATURES)))
existing_cols = [col for col in FULL_FEATURES if col in df.columns]
col_indices = [FULL_FEATURES.index(col) for col in existing_cols]
X_df = df[existing_cols].apply(pd.to_numeric, errors='coerce').fillna(0)
X[:, col_indices] = X_df.values.astype(float)
X_scaled = scaler.transform(X)

probas = rf.predict_proba(X_scaled)[:, 1]
y_true = df['is_fraud'].values

# Find optimal threshold via F1
precisions, recalls, thresholds = precision_recall_curve(y_true, probas)
f1_scores = 2 * (precisions * recalls) / (precisions + recalls + 1e-8)
best_idx = np.argmax(f1_scores)
best_threshold = thresholds[best_idx]

print(f"Actual frauds: {y_true.sum()} / {len(y_true)}")
print(f"Proba range: {probas.min():.6f} - {probas.max():.6f}")
print(f"Best F1 threshold: {best_threshold:.6f}")
print(f"  Precision: {precisions[best_idx]:.4f}")
print(f"  Recall:    {recalls[best_idx]:.4f}")
print(f"  F1:        {f1_scores[best_idx]:.4f}")

# Show detection counts at various thresholds
for t in [0.05, 0.10, 0.15, 0.20, best_threshold]:
    detected = (probas >= t).sum()
    actual = ((probas >= t) & (y_true == 1)).sum()
    print(f"  threshold={t:.4f}: detected={detected}, true_positives={actual}")

# Save the optimal threshold
joblib.dump(best_threshold, "ml-models/threshold.pkl")
print(f"\nSaved new RF threshold: {best_threshold:.6f}")
