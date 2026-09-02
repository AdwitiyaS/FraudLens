import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import (classification_report, confusion_matrix,
                              roc_auc_score, precision_score, recall_score,
                              f1_score, accuracy_score)
import joblib
import json
import os

os.makedirs("backend/models", exist_ok=True)

print("Loading dataset...")
df = pd.read_csv("data/creditcard.csv")
df = df.dropna(subset=["Class"])

print(f"Dataset shape: {df.shape}")
print(f"Fraud cases:   {int(df['Class'].sum())}")
print(f"Legit cases:   {int((df['Class']==0).sum())}")

X = df.drop("Class", axis=1)
y = df["Class"]

# Save column means (used by app.py for default feature values)
column_means = X.mean().tolist()
with open("backend/models/column_means.json", "w") as f:
    json.dump(column_means, f)
print("Column means saved.")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ── Random Forest ────────────────────────────────────────────────────────────
print("\nTraining Random Forest...")
rf_model = RandomForestClassifier(
    n_estimators=100,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)
rf_model.fit(X_train, y_train)

y_pred  = rf_model.predict(X_test)
y_proba = rf_model.predict_proba(X_test)[:, 1]

print("Random Forest Results:")
print(confusion_matrix(y_test, y_pred))
print(classification_report(y_test, y_pred))
roc = roc_auc_score(y_test, y_proba)
print(f"ROC-AUC: {roc:.4f}")

# Threshold tuning
threshold = 0.35
y_tuned = (y_proba >= threshold).astype(int)
print(f"\nTuned Threshold ({threshold}) Results:")
cm = confusion_matrix(y_test, y_tuned)
print(cm)
print(classification_report(y_test, y_tuned))

# ── Cross Validation ─────────────────────────────────────────────────────────
print("\nRunning Cross Validation (5-fold)...")
cv     = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(rf_model, X, y, cv=cv, scoring="roc_auc", n_jobs=-1)
print(f"CV ROC-AUC: {scores.mean():.4f} ± {scores.std():.4f}")

# ── Save Metrics JSON (used by /api/model-stats) ──────────────────────────────
metrics = {
    "accuracy":          round(accuracy_score(y_test, y_tuned), 4),
    "precision":         round(precision_score(y_test, y_tuned, zero_division=0), 4),
    "recall":            round(recall_score(y_test, y_tuned, zero_division=0), 4),
    "f1":                round(f1_score(y_test, y_tuned, zero_division=0), 4),
    "roc_auc":           round(roc, 4),
    "threshold":         threshold,
    "cv_mean":           round(float(scores.mean()), 4),
    "cv_std":            round(float(scores.std()), 4),
    "confusion_matrix":  cm.tolist(),
    "total_test_samples": len(y_test),
    "fraud_test_samples": int(y_test.sum())
}
with open("models/metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)
print("Metrics saved to models/metrics.json")

# ── Isolation Forest ─────────────────────────────────────────────────────────
print("\nTraining Isolation Forest (anomaly detection)...")
normal_data = X_train[y_train == 0]
iso_model = IsolationForest(
    contamination=0.0017,
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)
iso_model.fit(normal_data)
print("Isolation Forest trained.")

# ── Save Everything ───────────────────────────────────────────────────────────
joblib.dump(rf_model,  "backend/models/rf_model.pkl")
joblib.dump(iso_model, "backend/models/if_model.pkl")
joblib.dump(threshold, "backend/models/threshold.pkl")

print("\nAll models saved to backend/models/")
print("Training complete.")