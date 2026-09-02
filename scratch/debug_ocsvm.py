import joblib
ocsvm = joblib.load("ml-models/ocsvm_model.pkl")
print("OCSVM type:", type(ocsvm))
if hasattr(ocsvm, 'n_features_in_'):
    print("OCSVM n_features_in_:", ocsvm.n_features_in_)
