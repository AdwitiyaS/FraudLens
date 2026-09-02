# NeuralGuard – AI-Powered Fraud Detection System

---

## Overview

Financial fraud causes billions in losses annually.  
NeuralGuard is an AI-powered fraud detection platform that combines machine learning models with an interactive dashboard to detect and analyze suspicious transactions in real time.

---

## Features

- Interactive fraud analytics dashboard  
- Real-time fraud detection & alerts  
- Risk score visualization  
- Multiple ML model pipelines:
  - Random Forest + Isolation Forest (small datasets)
  - XGBoost + One-Class SVM (large datasets)
- SHAP-based explainability  
- Case review and transaction monitoring  

---

## Tech Stack

Backend:
- Node.js (Express)
- Python (Flask)

Frontend:
- EJS
- Chart.js

Database:
- MongoDB Atlas

---

## Machine Learning

- Models:
  - Random Forest
  - Isolation Forest
  - XGBoost
  - One-Class SVM

- Dataset:
  - IEEE Fraud Detection Dataset
  - Credit Card Dataset

---

## Run Locally

```bash
git clone https://github.com/CapstoneTeam38/CapstoneProject.git
cd CapstoneProject
npm install
pip install -r requirements.txt
