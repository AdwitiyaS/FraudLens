import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
import joblib, json, time

def train_rf_if(X, y):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train RF
    print("Training Random Forest...")
    start = time.time()
    rf = RandomForestClassifier(
        n_estimators=100, max_depth=15,
        random_state=42, n_jobs=-1, class_weight='balanced'
    )
    rf.fit(X_train, y_train)
    rf_time = time.time() - start

    rf_pred = rf.predict(X_test)
    rf_proba = rf.predict_proba(X_test)[:, 1]
    rf_cm = confusion_matrix(y_test, rf_pred)

    rf_metrics = {
        "model": "Random Forest",
        "accuracy": round(accuracy_score(y_test, rf_pred), 4),
        "precision": round(precision_score(y_test, rf_pred), 4),
        "recall": round(recall_score(y_test, rf_pred), 4),
        "f1": round(f1_score(y_test, rf_pred), 4),
        "roc_auc": round(roc_auc_score(y_test, rf_proba), 4),
        "training_time_seconds": round(rf_time, 2),
        "confusion_matrix": {
            "TP": int(rf_cm[1][1]), "FP": int(rf_cm[0][1]),
            "TN": int(rf_cm[0][0]), "FN": int(rf_cm[1][0])
        }
    }

    # Train IF
    print("Training Isolation Forest...")
    start = time.time()
    if_model = IsolationForest(
        n_estimators=100, random_state=42,
        n_jobs=-1, contamination=0.035
    )
    if_model.fit(X_train)
    if_time = time.time() - start

    if_scores = if_model.score_samples(X_test)
    if_preds = if_model.predict(X_test)
    if_binary = (if_preds == -1).astype(int)
    if_cm = confusion_matrix(y_test, if_binary)

    if_metrics = {
        "model": "Isolation Forest",
        "anomalies_detected": int((if_preds == -1).sum()),
        "anomaly_rate_percent": round((if_preds == -1).sum() / len(if_preds) * 100, 2),
        "accuracy": round(accuracy_score(y_test, if_binary), 4),
        "precision": round(precision_score(y_test, if_binary), 4),
        "recall": round(recall_score(y_test, if_binary), 4),
        "f1": round(f1_score(y_test, if_binary), 4),
        "roc_auc": round(roc_auc_score(y_test, if_scores), 4),
        "training_time_seconds": round(if_time, 2),
        "note": "Unsupervised - trained on all data",
        "confusion_matrix": {
            "TP": int(if_cm[1][1]), "FP": int(if_cm[0][1]),
            "TN": int(if_cm[0][0]), "FN": int(if_cm[1][0])
        }
    }

    joblib.dump(rf, 'models/rf_model.pkl')
    joblib.dump(if_model, 'models/if_model.pkl')
    print(f" RF trained in {rf_time:.2f}s")
    print(f" IF trained in {if_time:.2f}s")
    print(json.dumps(rf_metrics, indent=2))
    print(json.dumps(if_metrics, indent=2))

    return rf, if_model, X_test, y_test, rf_metrics, if_metrics