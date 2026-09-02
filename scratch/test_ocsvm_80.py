import joblib
import numpy as np

ocsvm = joblib.load("ml-models/ocsvm_model.pkl")
X = np.zeros((1, 80))
try:
    ocsvm.decision_function(X)
    print("OCSVM accepted 80 features!")
except Exception as e:
    print("OCSVM failed with 80 features:", e)
