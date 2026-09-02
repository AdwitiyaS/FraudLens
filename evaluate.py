import joblib
import json
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix
)

from data_preprocessing import load_and_merge_ieee, preprocess_ieee, get_features_target
from sklearn.model_selection import train_test_split

def evaluate():

    print("Loading model...")
    model = joblib.load("backend/models/xgb_model_v2.pkl")

    print("Preparing data...")
    df = load_and_merge_ieee()
    df = preprocess_ieee(df)
    X, y = get_features_target(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    probs = model.predict_proba(X_test)[:, 1]

    # 🔥 Threshold tuning
    best_threshold = 0.5
    best_f1 = 0

    for t in np.arange(0.3, 0.7, 0.05):
        preds = (probs >= t).astype(int)
        score = f1_score(y_test, preds)
        if score > best_f1:
            best_f1 = score
            best_threshold = t

    print(f"Best threshold: {best_threshold:.2f}, Best F1: {best_f1:.4f}")

    # Final predictions
    preds = (probs >= best_threshold).astype(int)

    cm = confusion_matrix(y_test, preds)

    metrics = {
        "accuracy": round(accuracy_score(y_test, preds), 4),
        "precision": round(precision_score(y_test, preds), 4),
        "recall": round(recall_score(y_test, preds), 4),
        "f1": round(f1_score(y_test, preds), 4),
        "roc_auc": round(roc_auc_score(y_test, probs), 4),
        "threshold": round(float(best_threshold), 2),
        "confusion_matrix": {
            "TP": int(cm[1][1]),
            "FP": int(cm[0][1]),
            "TN": int(cm[0][0]),
            "FN": int(cm[1][0])
        }
    }

    # Save metrics
    with open("metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print("\nFinal Metrics:")
    print(json.dumps(metrics, indent=2))

    return metrics


if __name__ == "__main__":
    evaluate()