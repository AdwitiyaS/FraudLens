import joblib
import numpy as np

try:
    xgb_model = joblib.load("ml-models/xgb_model_v2.pkl")
    scaler = joblib.load("ml-models/scaler.pkl")
    
    print("XGB Model type:", type(xgb_model))
    if hasattr(xgb_model, 'n_features_in_'):
        print("XGB Model n_features_in_:", xgb_model.n_features_in_)
    elif hasattr(xgb_model, 'feature_names_in_'):
        print("XGB Model feature_names_in_ count:", len(xgb_model.feature_names_in_))
    
    print("Scaler type:", type(scaler))
    if hasattr(scaler, 'n_features_in_'):
        print("Scaler n_features_in_:", scaler.n_features_in_)
except Exception as e:
    print("Error:", e)
