import shap
import matplotlib.pyplot as plt
import numpy as np
import joblib

def generate_shap_rf(rf_model, X_test_rf):
    print("Generating SHAP for RF...")
    X_sample = X_test_rf.sample(300, random_state=42)

    explainer = shap.TreeExplainer(rf_model)
    shap_values = explainer.shap_values(X_sample)

    fraud_shap = shap_values[:, :, 1] if not isinstance(shap_values, list) else shap_values[1]

    shap.summary_plot(fraud_shap, X_sample, max_display=20, show=False)
    plt.tight_layout()
    plt.savefig('models/shap_summary_rf.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("RF SHAP saved to models/shap_summary_rf.png")

def translate_feature(feature, shap_value):
    fraud = shap_value > 0
    if 'TransactionAmt' in feature:
        return "Transaction amount is unusually high" if fraud else "Amount appears normal"
    if feature.startswith('card'):
        return "Card usage pattern is abnormal" if fraud else "Card pattern looks normal"
    if 'addr' in feature:
        return "Billing address mismatch detected" if fraud else "Address is consistent"
    if 'email' in feature or 'domain' in feature:
        return "Suspicious email domain detected" if fraud else "Email appears legitimate"
    if feature == 'D1':
        return "Unusually long gap since last transaction" if fraud else "Transaction timing is normal"
    if feature.startswith('V'):
        num = int(feature[1:])
        if num <= 34:
            return "Amount deviates from card history" if fraud else "Amount within normal range"
        elif num <= 94:
            return "Abnormal card activity frequency" if fraud else "Card frequency normal"
        else:
            return "Unusual transaction velocity detected" if fraud else "Velocity normal"
    return "Unusual pattern detected" if fraud else "Pattern appears normal"