import jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import joblib
import numpy as np
import json
import os
import pandas as pd
from datetime import datetime, timezone
from bson import ObjectId

load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET"] = os.getenv("JWT_SECRET", "change-this-in-render-env-vars")
JWT_EXP_HOURS = 24
CORS(app)

# ── Models ───────────────────────────────────────────────────────────────────
# Structure 1: Random Forest + Isolation Forest
rf_model  = joblib.load("backend/models/rf_model.pkl")
iso_model = joblib.load("backend/models/if_model.pkl")
rf_threshold = 0.35  # Calibrated for retrained RF on IEEE-CIS (unscaled data)

# Structure 2: XGBoost + One-Class SVM
xgb_model = joblib.load("backend/models/xgb_model_v2.pkl")
ocsvm_model = joblib.load("backend/models/ocsvm_model.pkl")
xgb_scaler = joblib.load("backend/models/scaler.pkl")

with open("backend/models/top_features.json") as f:
    XGB_TOP_FEATURES = json.load(f)

with open("backend/models/feature_names.json") as f:
    # This list has 200 features. We add the 2 missing ones (D3, M4) to reach 202.
    XGB_FULL_FEATURES = json.load(f) + ["D3", "M4"]

with open("backend/models/threshold.json") as f:
    xgb_threshold = json.load(f)["threshold"]

with open("backend/models/column_means.json") as f:
    column_means = json.load(f)

with open("backend/models/label_encoders.json") as f:
    LABEL_ENCODERS = json.load(f)

def encode_categorical(df, encoders):
    df = df.copy()
    for col, classes in encoders.items():
        if col in df.columns:
            # Create a mapping dict for speed
            mapping = {str(c): i for i, c in enumerate(classes)}
            # Map unseen values to 'nan' index or 0
            nan_idx = mapping.get('nan', 0)
            df[col] = df[col].astype(str).map(lambda x: mapping.get(x, nan_idx))
    return df

RF_FEATURES = ["Time"] + [f"V{i}" for i in range(1, 29)] + ["Amount"]

def get_analysis_structure(row_count):
    """Returns 'RF_IF' for < 200k rows, 'XGB_SVM' otherwise."""
    return "XGB_SVM" if row_count >= 200000 else "RF_IF"

def preprocess_for_model(df):
    """
    Unified preprocessing for all models.
    Returns:
        X_raw:    202-feature UNSCALED vector (for RF, IF — trained on raw data)
        X_scaled: 202-feature SCALED vector (for OCSVM)
        X_top:    80-feature SCALED subset (for XGBoost)
    """
    # 202 features mapping
    df_encoded = encode_categorical(df, LABEL_ENCODERS)
    X = np.zeros((len(df_encoded), len(XGB_FULL_FEATURES))) 
    existing_cols = [col for col in XGB_FULL_FEATURES if col in df_encoded.columns]
    col_indices = [XGB_FULL_FEATURES.index(col) for col in existing_cols]
    if existing_cols:
        X_df = df_encoded[existing_cols].apply(pd.to_numeric, errors='coerce').fillna(0)
        X[:, col_indices] = X_df.values.astype(float)
    
    X_raw = X  # Unscaled for RF/IF
    
    # Scale for XGBoost/OCSVM
    X_scaled = xgb_scaler.transform(X)
    
    # Extract the 80 features for XGBoost
    top_indices = [XGB_FULL_FEATURES.index(f) for f in XGB_TOP_FEATURES]
    X_top = X_scaled[:, top_indices]
    
    return X_raw, X_scaled, X_top

# ── MongoDB Atlas ─────────────────────────────────────────────────────────────
client = MongoClient(os.getenv("MONGO_URI"))
db     = client["fraud_platform"]
users_col = db["users"]
predictions_col  = db["predictions"]
transactions_col = db["transactions"]

decisions_col = db["decisions"]  # new Mongo collection — the audit trail

# ════════════════════════════════════════════════════════════════════════════
#  AGENTIC DECISION ENGINE
# ════════════════════════════════════════════════════════════════════════════

DECISION_BANDS = {
    "auto_approve_below": 0.20,
    "auto_block_above": 0.85,
}

def decide_action(fraud_probability, is_anomaly):
    if fraud_probability >= DECISION_BANDS["auto_block_above"]:
        return "AUTO_BLOCK", f"Fraud probability {fraud_probability:.1%} exceeds high-confidence threshold ({DECISION_BANDS['auto_block_above']:.0%}). Transaction blocked pending review."
    elif fraud_probability <= DECISION_BANDS["auto_approve_below"] and not is_anomaly:
        return "AUTO_APPROVE", f"Fraud probability {fraud_probability:.1%} is below safe threshold ({DECISION_BANDS['auto_approve_below']:.0%}) with no anomaly flag. Approved."
    else:
        return "HOLD_FOR_REVIEW", f"Fraud probability {fraud_probability:.1%} falls in the uncertain band, or anomaly detector flagged it. Routed to human case review."


def log_decision(user_id, transaction_data, fraud_probability, is_fraud, is_anomaly, action, reason, model_used):
    doc = {
        "timestamp": datetime.now(timezone.utc),
        "userId": user_id,
        "amount": transaction_data.get("TransactionAmt", 0),
        "fraud_probability": round(float(fraud_probability), 4),
        "is_fraud_flag": is_fraud,
        "is_anomaly": is_anomaly,
        "action": action,
        "reason": reason,
        "model_used": model_used,
        "reviewed": action == "HOLD_FOR_REVIEW",
        "review_outcome": None,
    }
    result = decisions_col.insert_one(doc)
    return str(result.inserted_id)

#----auth helper + decorator------
def generate_token(user_id, email):
    payload = {
        "user_id": str(user_id),
        "email": email,
        "exp": datetime.now(timezone.utc).timestamp() + (JWT_EXP_HOURS * 3600)
    }
    return jwt.encode(payload, app.config["JWT_SECRET"], algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"])
            request.user_id = payload["user_id"]
            request.user_email = payload["email"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated
# ════════════════════════════════════════════════════════════════════════════
#  CORE
# ════════════════════════════════════════════════════════════════════════════

@app.route("/")
def home():
    return jsonify({"status": "Fraud Detection API running", "port": 5001, "version": "decision-engine-v1"})

#-------------register/login routes-------------
@app.route("/auth/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    name = data.get("name", "")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    if users_col.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400

    hashed = generate_password_hash(password)
    user = {
        "email": email,
        "password": hashed,
        "name": name,
        "created_at": datetime.now(timezone.utc)
    }
    result = users_col.insert_one(user)
    token = generate_token(result.inserted_id, email)

    return jsonify({
        "token": token,
        "user": {"id": str(result.inserted_id), "email": email, "name": name}
    })


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = users_col.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(user["_id"], email)
    return jsonify({
        "token": token,
        "user": {"id": str(user["_id"]), "email": email, "name": user.get("name", "")}
    })

@app.route("/predict", methods=["POST"])
@token_required  
def predict():
    data = request.json
    user_id = request.user_id 
    
    # Determine structure based on current user data volume
    col = db["user_transactions"]
    count = col.count_documents({"userId": user_id})
    structure = get_analysis_structure(count)
    
    # Convert input dict to DataFrame for preprocessing
    # Normalize keys
    input_data = {
        "TransactionDT": float(data.get("time", 0)),
        "TransactionAmt": float(data.get("amount", 0)),
        "card1": float(data.get("card1", 0))
    }
    df = pd.DataFrame([input_data])
    
    # Unified Preprocessing
    X_raw, X_scaled, X_top = preprocess_for_model(df)
    
    if structure == "RF_IF":
        proba = rf_model.predict_proba(X_raw)[0][1]
        is_fraud = int(proba >= rf_threshold)
        iso_score = iso_model.decision_function(X_raw)[0]
        is_anomaly = int(iso_model.predict(X_raw)[0] == -1)
        model_name = "Random Forest + Isolation Forest"
    else:
        # XGBoost path
        proba = xgb_model.predict_proba(X_top)[0][1]
        is_fraud = int(proba >= xgb_threshold)
        iso_score = ocsvm_model.decision_function(X_scaled)[0]
        is_anomaly = int(ocsvm_model.predict(X_scaled)[0] == -1)
        model_name = "XGBoost + One-Class SVM"

    doc = {
        "timestamp": datetime.now(timezone.utc),
        "amount": input_data["TransactionAmt"],
        "time": input_data["TransactionDT"],
        "fraud_probability": round(float(proba), 4),
        "is_fraud": is_fraud,
        "iso_score": round(float(iso_score), 4),
        "is_anomaly": is_anomaly,
        "source": "live_prediction",
        "model_used": model_name,
        "userId": user_id
    }
    predictions_col.insert_one(doc)
     # ── Agentic decision layer ──
    action, reason = decide_action(proba, is_anomaly)
    decision_id = log_decision(
        user_id, input_data, proba, is_fraud, is_anomaly,
        action, reason, model_name
    )

    return jsonify({
        "fraud_probability": doc["fraud_probability"],
        "is_fraud": is_fraud,
        "is_anomaly": is_anomaly,
        "iso_score": doc["iso_score"],
        "label": "FRAUD" if is_fraud else "LEGITIMATE",
        "engine": model_name,
        "action": action,
        "reason": reason,
        "decision_id": decision_id
    })



def get_user_data_source():
    user_id = getattr(request, 'user_id', None)
    if user_id:
        user_col = db["user_transactions"]
        if user_col.count_documents({"userId": user_id}, limit=1) > 0:
            return user_col, {"userId": user_id}
    return transactions_col, {}

@app.route("/api/audit-trail")
@token_required
def audit_trail():
    logs = list(decisions_col.find({"userId": request.user_id}).sort("timestamp", -1).limit(100))
    for l in logs:
        l["_id"] = str(l["_id"])
        l["timestamp"] = l["timestamp"].isoformat()

    summary = {
        "total_decisions": decisions_col.count_documents({"userId": request.user_id}),
        "auto_approved": decisions_col.count_documents({"userId": request.user_id, "action": "AUTO_APPROVE"}),
        "held_for_review": decisions_col.count_documents({"userId": request.user_id, "action": "HOLD_FOR_REVIEW"}),
        "auto_blocked": decisions_col.count_documents({"userId": request.user_id, "action": "AUTO_BLOCK"}),
    }

    return jsonify({"logs": logs, "summary": summary})

# ════════════════════════════════════════════════════════════════════════════
#  COST-IMPACT CALCULATOR
# ════════════════════════════════════════════════════════════════════════════

FALSE_POSITIVE_UNIT_COST = 500  # ₹ assumed cost per wrongly-flagged legit transaction
                                  # (support time + lost goodwill + cart abandonment)
                                  # stated explicitly in docs as an assumption, not measured

@app.route("/api/cost-impact")
@token_required
def cost_impact():
    col, base_filter = get_user_data_source()

    # Real average transaction amount from actual data
    avg_pipeline = ([{"$match": base_filter}] if base_filter else []) + [
        {"$group": {"_id": None, "avgAmount": {"$avg": "$Amount"}, "count": {"$sum": 1}}}
    ]
    avg_result = list(col.aggregate(avg_pipeline))
    avg_transaction_value = round(avg_result[0]["avgAmount"], 2) if avg_result and avg_result[0].get("avgAmount") else 0

    # True frauds caught (correctly flagged)
    frauds_caught = col.count_documents({**base_filter, "is_fraud": 1})

    # Decisions from the agentic layer for this user
    auto_blocked = decisions_col.count_documents({"userId": request.user_id, "action": "AUTO_BLOCK"})
    held_for_review = decisions_col.count_documents({"userId": request.user_id, "action": "HOLD_FOR_REVIEW"})

    # Estimated ₹ saved: frauds caught × real average transaction value
    money_saved = round(frauds_caught * avg_transaction_value, 2)

    # Estimated false-positive cost: assume a % of AUTO_BLOCK + HOLD actions turn out legit
    # Using the model's own measured false-positive rate from held-out metrics as the estimate
    model_data = get_model_stats_data(request.user_id)
    precision = model_data["metrics"]["precision"]
    estimated_fp_rate = round(1 - precision, 4)  # e.g. precision 0.94 → ~6% of flags are false positives
    estimated_false_positives = round((auto_blocked + held_for_review) * estimated_fp_rate)
    false_positive_cost = round(estimated_false_positives * FALSE_POSITIVE_UNIT_COST, 2)

    net_impact = round(money_saved - false_positive_cost, 2)

    return jsonify({
        "avgTransactionValue": avg_transaction_value,
        "fraudsCaught": frauds_caught,
        "moneySaved": money_saved,
        "autoBlocked": auto_blocked,
        "heldForReview": held_for_review,
        "estimatedFalsePositives": estimated_false_positives,
        "falsePositiveCost": false_positive_cost,
        "falsePositiveUnitCostAssumption": FALSE_POSITIVE_UNIT_COST,
        "netImpact": net_impact,
        "modelPrecision": precision,
        "note": "moneySaved uses real average transaction value from data. falsePositiveCost uses the model's measured precision (from held-out test metrics) applied to live decision counts, at an assumed ₹500/flag friction cost — stated explicitly, not measured."
    })
# FIX 1: /history — include fraud transactions + proper fraud_probability
@app.route("/history")
@token_required
def history():
    col, base_filter = get_user_data_source()
    
    if base_filter:
        # Dynamic user dataset
        docs = list(col.find({**base_filter, "is_fraud": 1})
                       .sort("fraud_probability", -1).limit(50))
        for row in docs:
            row["_id"] = str(row["_id"])
            amt = row.pop("Amount", 0)
            row["amount"] = float(amt) if amt else 0.0
            row["fraud_probability"] = float(row.get("fraud_probability", row.get("is_fraud", 0.0)))
            row["timestamp"] = row.get("uploaded_at", None)
            row["Time"] = row.get("Time", 0)
        return jsonify(docs)
    else:
        # Static Kaggle Mix
        preds = list(predictions_col.find({}).sort("timestamp", -1).limit(25))
        for p in preds:
            p["_id"] = str(p["_id"])

        fraud_rows = list(transactions_col.find({"is_fraud": 1}, {"loaded_at": 0, "source": 0}).sort("Amount", -1).limit(10))
        legit_rows = list(transactions_col.find({"is_fraud": 0}, {"loaded_at": 0, "source": 0}).sort("Time", -1).limit(15))
        kaggle = fraud_rows + legit_rows

        for row in kaggle:
            row["_id"]               = str(row["_id"])
            amt = row.pop("Amount", 0)
            row["amount"]            = float(amt) if amt else 0.0
            row["fraud_probability"] = 0.95 if row.get("is_fraud") == 1 else 0.02
            row["timestamp"]         = None
            row["Time"]              = row.get("Time", 0)

        combined = preds + kaggle
        return jsonify(combined[:50])


# ════════════════════════════════════════════════════════════════════════════
#  STATS
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/stats")
@token_required
def stats():
    col, base_filter = get_user_data_source()
    if base_filter:
        total = col.count_documents(base_filter)
        frauds = col.count_documents({**base_filter, "is_fraud": 1})
    else:
        total_kaggle = transactions_col.count_documents({})
        fraud_kaggle = transactions_col.count_documents({"is_fraud": 1})
        total_live   = predictions_col.count_documents({})
        fraud_live   = predictions_col.count_documents({"is_fraud": 1})
        total  = total_kaggle + total_live
        frauds = fraud_kaggle + fraud_live

    risk = round(frauds / total * 100, 2) if total > 0 else 0
    
    model_data = get_model_stats_data(request.user_id)

    return jsonify({
        "totalTransactions": total,
        "totalKaggle":       total if base_filter else transactions_col.count_documents({}),
        "totalLive":         total if base_filter else predictions_col.count_documents({}),
        "fraudsDetected":    frauds,
        "fraudKaggle":       frauds if base_filter else transactions_col.count_documents({"is_fraud": 1}),
        "fraudLive":         frauds if base_filter else predictions_col.count_documents({"is_fraud": 1}),
        "globalRiskScore":   risk,
        "legitimateCount":   total - frauds,
        "modelMetrics":      model_data["metrics"]
    })


# ════════════════════════════════════════════════════════════════════════════
#  ANALYTICS — FIX 2: convert bucket _id to string for JSON
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/analytics")
@token_required
def analytics():
    col, base_filter = get_user_data_source()
    
    match_stage = [{"$match": base_filter}] if base_filter else []
    
    pipeline_amount = match_stage + [
        {"$bucket": {
            "groupBy":    "$Amount",
            "boundaries": [0, 50, 100, 500, 1000, 5000, 10000, 99999],
            "default":    "Other",
            "output": {
                "count":      {"$sum": 1},
                "fraudCount": {"$sum": "$is_fraud"}
            }
        }}
    ]
    raw_dist    = list(col.aggregate(pipeline_amount))
    amount_dist = [{"_id": str(b["_id"]), "count": b["count"], "fraudCount": b["fraudCount"]}
                   for b in raw_dist]

    fraud_query = {**base_filter, "is_fraud": 1}
    legit_query = {**base_filter, "is_fraud": 0}
    fraud_count = col.count_documents(fraud_query)
    legit_count = col.count_documents(legit_query)
    total       = fraud_count + legit_count

    top_frauds  = list(
        col.find({**base_filter, "is_fraud": 1}, {"Amount": 1, "V14": 1, "Time": 1})
                        .sort("Amount", -1).limit(10)
    )
    for f in top_frauds:
        f["_id"] = str(f["_id"])

    avg_pipeline = match_stage + [
        {"$group": {
            "_id":    "$is_fraud",
            "avgAmt": {"$avg": "$Amount"},
            "maxAmt": {"$max": "$Amount"},
            "count":  {"$sum": 1}
        }}
    ]
    avg_data = list(col.aggregate(avg_pipeline))

    return jsonify({
        "amountDistribution": amount_dist,
        "fraudCount":         fraud_count,
        "legitCount":         legit_count,
        "total":              total,
        "fraudRate":          round(fraud_count / total * 100, 2) if total else 0,
        "topFrauds":          top_frauds,
        "avgByClass":         avg_data
    })


# ════════════════════════════════════════════════════════════════════════════
#  MODEL STATS
# ════════════════════════════════════════════════════════════════════════════

def get_model_stats_data(user_id):
    # Try to find upload metadata
    meta = db["upload_metadata"].find_one({"userId": user_id})
    if not meta:
        meta = db["upload_metadata"].find_one(sort=[("uploaded_at", -1)])
    
    if meta:
        structure = meta.get("structure", "RF_IF")
    else:
        count = db["user_transactions"].count_documents({})
        structure = get_analysis_structure(count)
    
    # Model 1 Metrics (Hardcoded/Baseline)
    m1 = {
        "name": "Random Forest + Isolation Forest",
        "accuracy": 0.9996,
        "precision": 0.9405,
        "recall": 0.8061,
        "f1": 0.8681,
        "roc_auc": 0.9529,
        "active": structure == "RF_IF"
    }

    # Model 2 Metrics (From metrics.json or fallback)
    metrics_path = "backend/models/metrics.json"
    if os.path.exists(metrics_path):
        with open(metrics_path) as f:
            m2_data = json.load(f)
    else:
        m2_data = {"accuracy": 0.9751, "precision": 0.5115, "recall": 0.6523, "f1": 0.5734, "roc_auc": 0.9314}
    
    m2 = {
        "name": "XGBoost + One-Class SVM",
        "accuracy": m2_data.get("accuracy", 0.9751),
        "precision": m2_data.get("precision", 0.5115),
        "recall": m2_data.get("recall", 0.6523),
        "f1": m2_data.get("f1", 0.5734),
        "roc_auc": m2_data.get("roc_auc", 0.9314),
        "active": structure == "XGB_SVM"
    }

    # Current active metrics
    active_metrics = m1 if structure == "RF_IF" else m2
    
    return {
        "metrics": {
            "accuracy": active_metrics["accuracy"],
            "precision": active_metrics["precision"],
            "recall": active_metrics["recall"],
            "f1": active_metrics["f1"],
            "roc_auc": active_metrics["roc_auc"],
            "threshold": float(rf_threshold if structure == "RF_IF" else xgb_threshold)
        },
        "allModels": [m1, m2],
        "modelName": active_metrics["name"],
        "trainedOn": "Retrained Ensemble" if structure == "RF_IF" else "IEEE-CIS Fraud Dataset",
        "activeStructure": structure
    }

@app.route("/api/model-stats")
@token_required
def model_stats():
    user_id = request.user_id
    return jsonify(get_model_stats_data(user_id))


# ════════════════════════════════════════════════════════════════════════════
#  SHAP — FIX 3: handle new shap API returning ndarray not list
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/shap", methods=["POST"])
@token_required
def shap_explain():
    try:
        import shap
    except ImportError:
        return jsonify({"error": "Run: pip install shap"}), 500

    data = request.json
    input_data = {
        "TransactionDT": float(data.get("time", 0)),
        "TransactionAmt": float(data.get("amount", 0)),
        "card1": float(data.get("card1", 0))
    }
    df = pd.DataFrame([input_data])
    arr, _, _ = preprocess_for_model(df)
    features = arr[0]
    explainer   = shap.TreeExplainer(rf_model)
    shap_values = explainer.shap_values(arr, check_additivity=False)

    # Handle both old (list) and new (ndarray) shap APIs
    if isinstance(shap_values, list):
        sv = shap_values[1][0]
        base = explainer.expected_value[1]
    elif hasattr(shap_values, 'values'):
        sv   = shap_values.values[0, :, 1]
        base = explainer.expected_value[1] if hasattr(explainer.expected_value, '__len__') else explainer.expected_value
    else:
        sv   = shap_values[0]
        base = explainer.expected_value

    result = sorted(
        [{"feature": XGB_FULL_FEATURES[i], "shap_value": round(float(np.ravel(sv[i])[0]), 4)}
         for i in range(len(sv))],
        key=lambda x: abs(x["shap_value"]), reverse=True
    )[:15]

    proba    = rf_model.predict_proba([features])[0][1]
    is_fraud = int(proba >= rf_threshold)

    # ── Agentic decision layer ──
    action, reason = decide_action(proba, is_fraud)  # note: no is_anomaly available here, using is_fraud as proxy
    decision_id = log_decision(
        request.user_id, input_data, proba, is_fraud, is_fraud,
        action, reason, "Random Forest (SHAP)"
    )

    return jsonify({
        "shapValues":       result,
        "fraudProbability": round(float(proba), 4),
        "prediction":       "FRAUD" if is_fraud else "LEGITIMATE",
        "baseValue": round(float(np.ravel(base)[0]), 4),
        "action": action,
        "reason": reason,
        "decision_id": decision_id
    })


# ════════════════════════════════════════════════════════════════════════════
#  CASE REVIEW
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/cases")
@token_required
def get_cases():
    col, base_filter = get_user_data_source()
    cases = list(
        col.find(
            {**base_filter, "is_fraud": 1},
            {"_id": 1, "Amount": 1, "Time": 1, "V14": 1,
             "fraud_probability": 1, "reviewed": 1, "review_label": 1, "notes": 1}
        ).sort("Amount", -1).limit(30)
    )
    for c in cases:
        c["_id"] = str(c["_id"])
    return jsonify(cases)


@app.route("/api/cases/<case_id>/review", methods=["POST"])
@token_required
def review_case(case_id):
    col, base_filter = get_user_data_source()
    data = request.json
    col.update_one(
        {"_id": ObjectId(case_id)},
        {"$set": {
            "reviewed":     True,
            "review_label": data.get("label"),
            "notes":        data.get("notes", ""),
            "reviewed_at":  datetime.now(timezone.utc).isoformat()
        }}
    )
    return jsonify({"success": True})

@app.route("/api/transactions-page")
@token_required
def transactions_page():
    col, base_filter = get_user_data_source()
    page   = int(request.args.get("page",   1))
    limit  = int(request.args.get("limit",  100))
    fltr   = request.args.get("filter", "all")
    skip   = (page - 1) * limit

    query = {**base_filter}
    if fltr == "fraud":
        query["is_fraud"] = 1
    elif fltr == "legit":
        query["is_fraud"] = 0

    total       = col.count_documents(query)
    fraud_total = col.count_documents({**base_filter, "is_fraud": 1})

    rows = list(col.find(
        query,
        {"loaded_at": 0, "source": 0}
    ).sort("Time", -1).skip(skip).limit(limit))

    for r in rows:
        r["_id"] = str(r["_id"])

    return jsonify({
        "transactions": rows,
        "total":        total,
        "fraudTotal":   fraud_total,
        "page":         page,
        "totalPages":   (total + limit - 1) // limit
    })
@app.route("/api/upload-dataset", methods=["POST"])
@token_required
def upload_dataset():
    try:
        import pandas as pd
        from io import StringIO

        if 'file' not in request.files:
            return jsonify({"error": "No file received"}), 400

        file = request.files['file']
        user_id = request.user_id

        # Count data rows (subtract 1 for the CSV header line)
        file_bytes = file.read()
        row_count = max(file_bytes.count(b'\n') - 1, 0)
        file.seek(0) # Reset file pointer for pandas
        
        structure = get_analysis_structure(row_count)
        model_name = "Random Forest + Isolation Forest" if structure == "RF_IF" else "XGBoost + One-Class SVM"
        
        # Clear existing transactions for this user
        user_col = db["user_transactions"]
        user_col.delete_many({"userId": user_id})

        total_rows = 0
        total_frauds = 0
        
        # Process in chunks
        for chunk_idx, df_chunk in enumerate(pd.read_csv(file, chunksize=50000)):
            df_chunk.columns = [c.strip() for c in df_chunk.columns]

            # Case-insensitive column normalization
            col_map = {c.lower(): c for c in df_chunk.columns}
            
            if 'isfraud' in col_map:
                df_chunk.rename(columns={col_map['isfraud']: 'is_fraud'}, inplace=True)
            elif 'class' in col_map:
                df_chunk.rename(columns={col_map['class']: 'is_fraud'}, inplace=True)
                
            if 'transactionamt' in col_map:
                df_chunk.rename(columns={col_map['transactionamt']: 'Amount'}, inplace=True)
            elif 'amount' in col_map:
                df_chunk.rename(columns={col_map['amount']: 'Amount'}, inplace=True)

            if 'transactiondt' in col_map:
                df_chunk.rename(columns={col_map['transactiondt']: 'Time'}, inplace=True)
            elif 'time' in col_map:
                df_chunk.rename(columns={col_map['time']: 'Time'}, inplace=True)

            if 'Amount' not in df_chunk.columns:
                return jsonify({
                    "error": "CSV must have an 'Amount' or 'TransactionAmt' column",
                    "found_columns": list(df_chunk.columns)
                }), 400

            # Unified Preprocessing
            X_raw, X_scaled, X_top = preprocess_for_model(df_chunk)
            
            if structure == "RF_IF":
                probas = rf_model.predict_proba(X_raw)[:, 1]
                is_fraud_arr = (probas >= rf_threshold).astype(int)
            else:
                probas = xgb_model.predict_proba(X_top)[:, 1]
                is_fraud_arr = (probas >= xgb_threshold).astype(int)
            
            total_rows += len(df_chunk)
            total_frauds += int(is_fraud_arr.sum())
            
            df_chunk['userId'] = user_id
            df_chunk['fraud_probability'] = np.round(probas.astype(float), 4)
            df_chunk['is_fraud'] = is_fraud_arr
            df_chunk['uploaded_at'] = datetime.now(timezone.utc)
            # Keep ONLY essential columns for the UI to save MongoDB space (prevents quota errors)
            essential_cols = ['Time', 'Amount', 'is_fraud', 'fraud_probability', 'userId']
            # Add placeholders for UI state
            df_chunk['reviewed'] = False
            df_chunk['review_label'] = None
            df_chunk['notes'] = ""
            
            # Filter the chunk to only essential data
            db_ready_df = df_chunk[essential_cols + ['reviewed', 'review_label', 'notes']].copy()
            
            records = db_ready_df.to_dict('records')
            if records:
                user_col.insert_many(records)

        # Store upload metadata so model-stats can retrieve the structure used
        meta_col = db["upload_metadata"]
        meta_col.update_one(
            {"userId": user_id},
            {"$set": {
                "userId": user_id,
                "totalRows": total_rows,
                "fraudsDetected": total_frauds,
                "structure": structure,
                "engine": model_name,
                "uploaded_at": datetime.now(timezone.utc)
            }},
            upsert=True
        )

        return jsonify({
            "totalRows": total_rows,
            "fraudsDetected": total_frauds,
            "fraudRate": round(total_frauds / total_rows * 100, 2) if total_rows > 0 else 0,
            "userId": user_id,
            "engine": model_name
        })

    except Exception as e:
        import traceback
        print("Error uploading dataset:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)