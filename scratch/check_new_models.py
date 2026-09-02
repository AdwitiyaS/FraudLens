import joblib
rf = joblib.load("new models/rf_model.pkl")
print("New RF n_features_in_:", rf.n_features_in_)
if_model = joblib.load("new models/if_model.pkl")
print("New IF n_features_in_:", if_model.n_features_in_)
