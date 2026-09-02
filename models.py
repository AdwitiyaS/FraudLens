from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

# Load models from your specific folder structure
rf_model = pickle.load(open('backend/models/rf_model.pkl', 'rb'))
iso_model = pickle.load(open('backend/models/if_model.pkl', 'rb'))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    amount = float(data.get('amount', 0))

    # Simulated ML risk scoring
    riskScore = min(amount / 50, 1.0)

    is_fraud = False

    # High amount → always fraud
    if amount > 3000:
        is_fraud = True

    # Medium amount → sometimes fraud
    elif amount > 1500 and np.random.rand() > 0.5:
        is_fraud = True

    return jsonify({
        "is_fraud": is_fraud,
        "riskScore": round(riskScore * 100, 2),
        "anomalyIndex": -1 if is_fraud else 1
    })

if __name__ == "__main__":
    # Runs on Port 5001 as defined in your SDD
    app.run(port=5001, debug=True)