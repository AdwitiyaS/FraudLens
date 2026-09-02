import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import json

def load_and_merge_ieee():
    print("Loading IEEE-CIS datasets...")
    
    train_tx = pd.read_csv('data/train_transaction.csv', nrows=100000) #load only first 100k rows for memory efficiency
    train_id = pd.read_csv('data/train_identity.csv', nrows=100000) #load only first 100k rows for memory efficiency
    
    print(f"Transaction shape: {train_tx.shape}")
    print(f"Identity shape: {train_id.shape}")
    
    df = train_tx.merge(train_id, on='TransactionID', how='left')
    print(f"Merged shape: {df.shape}")
    
    return df

def preprocess_ieee(df):
    print("Preprocessing...")
    
    thresh = len(df) * 0.5
    initial_cols = df.shape[1]
    df = df.dropna(axis=1, thresh=thresh)
    print(f"Dropped {initial_cols - df.shape[1]} columns with >50% missing")
    
    num_cols = df.select_dtypes(include=[np.number]).columns
    for col in num_cols:
        if df[col].isnull().sum() > 0:
            df[col] = df[col].fillna(df[col].median())
    
    cat_cols = df.select_dtypes(include=['object', 'string']).columns
    le_dict = {}
    for col in cat_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        le_dict[col] = list(le.classes_)
    import os
    os.makedirs('models', exist_ok=True)
    with open('models/label_encoders.json', 'w') as f:
        json.dump(le_dict, f)
    
    print(f"Final shape: {df.shape}")
    return df

def get_features_target(df):
    drop_cols = ['TransactionID', 'isFraud']
    X = df.drop(columns=drop_cols, errors='ignore')
    y = df['isFraud']
    
    with open('models/feature_names.json', 'w') as f:
        json.dump(list(X.columns), f)
    
    print(f"Features: {X.shape[1]}, Samples: {X.shape[0]}")
    print(f"Fraud ratio: {y.sum() / len(y) * 100:.2f}%")
    
    return X, y

if __name__ == '__main__':
    df = load_and_merge_ieee()
    df = preprocess_ieee(df)
    X, y = get_features_target(df)
    print("Preprocessing complete. Ready for training.")