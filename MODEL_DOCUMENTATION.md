# ML Models - IEEE-CIS Fraud Detection

## Models Trained

### XGBoost (xgb_model_v2.pkl)
- ROC-AUC: 0.9314
- Threshold: 0.35
- Features: Top 80 by importance
- Dataset: IEEE-CIS 400K rows

### Random Forest (rf_model.pkl)
- Trained on IEEE-CIS full feature set
- 100 estimators, balanced class weights
- Baseline for comparison with XGBoost

### Isolation Forest (if_model.pkl)
- Unsupervised anomaly detection
- Contamination: 3.5% (fraud rate)
- Detects outlier transactions

### One-Class SVM (ocsvm_model.pkl)
- Trained only on legitimate transactions
- Learns boundary of normal behavior
- Uses StandardScaler for preprocessing

## Feature Set
All models use standardized features from IEEE-CIS dataset:
- TransactionDT, TransactionAmt
- card1-card6 (card details)
- addr1, addr2 (address)
- P_emaildomain, R_emaildomain
- C1-C14 (counting features)
- D1-D15 (timedelta features)
- M1-M9 (match flags)
- V1-V339 (Vesta proprietary features)

Total: 120+ features, 80 selected for XGBoost

## Training Environment
- Google Colab with GPU
- pandas, scikit-learn, xgboost
- Dataset: 400K transactions from IEEE-CIS

## Model Artifacts Location
- backend/models/xgb_model_v2.pkl (1.2 MB)
- backend/models/rf_model.pkl (34 MB)
- backend/models/if_model.pkl (779 KB)
- backend/models/ocsvm_model.pkl (2.5 KB)
- backend/models/scaler.pkl (7 KB)