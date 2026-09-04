# FraudLens

FraudLens is a fraud detection platform built for the Razorpay AI Buildathon (Track 2: AI Risk Manager). It flags risky transactions in real time, explains why a transaction was flagged, and routes decisions through an agentic layer that either auto-approves, holds for human review, or auto-blocks — with every decision logged to an audit trail.

**Live app:** https://fraudlens-app.onrender.com
**Live API:** https://fraudlens-d30p.onrender.com

## The problem

Merchants lose money to fraud in two directions at once. Missed fraud costs them the transaction. Over-flagging legitimate customers costs them trust and future business. Most detection systems report accuracy and stop there, which hides the second cost entirely. FraudLens shows both sides: what fraud it actually caught, and what the false-positive friction costs, using the model's own measured precision rather than a made-up number.

## What it does

- A transaction (or a batch via CSV upload) gets scored by a trained model.
- The model's output (fraud probability, anomaly flag) is passed to a decision engine, which returns one of three actions — `AUTO_APPROVE`, `HOLD_FOR_REVIEW`, or `AUTO_BLOCK` — with a plain-English reason.
- Every decision is logged to MongoDB with a timestamp, building a full audit trail of what the system decided and why.
- SHAP explainability shows which features drove a given prediction.
- The cost-impact calculator separates two things explicitly: money saved (frauds caught × real average transaction value) and estimated false-positive cost (real measured precision applied against a stated $500 assumption per false flag — not measured, and the API says so directly).

## The decision engine

This is the piece we'd point you to first. Fraud detection alone is a solved problem in the sense that plenty of models can output a probability. What's harder — and what this track is actually asking for — is what a business does with that probability. FraudLens doesn't just classify a transaction as fraud or not. It decides an action, explains the reason in plain language, and writes it down. High-probability fraud gets auto-blocked. Low-probability, non-anomalous transactions get auto-approved. Everything in between goes to a human reviewer with the reasoning attached. The full history is visible on the Audit Trail page.

There's also a failure fallback: if model inference throws an error, the system doesn't crash and doesn't silently approve either — it routes to `HOLD_FOR_REVIEW` with a reason explaining that inference failed. Fail-safe, not fail-open.

## Models

Two model pairs, selected based on how much data a user has uploaded:

- **Random Forest + Isolation Forest** — datasets ≤200,000 rows. 94.1% precision, 80.6% recall, F1 86.8%, ROC-AUC 95.3%, on a genuine 80/20 stratified held-out split.
- **XGBoost + One-Class SVM** — datasets >200,000 rows, for lower per-inference cost at scale (80 features vs. 202). Meaningfully weaker (~51% precision, ~65% recall), trained on 400K of the ~590K rows in IEEE-CIS. The remaining ~190K rows are untouched and not counted as held-out validation anywhere in this project.

## Dataset

IEEE-CIS Fraud Detection data — real, anonymized transaction data (not synthetic), sourced from Vesta Corporation via Kaggle. We evaluated PaySim as an alternative and dropped it: its feature schema didn't match what our trained model expects, so we left it out rather than force a comparison that wouldn't mean anything.

## Honest metrics

- Accuracy, precision, recall, F1, and ROC-AUC above are from a real, stratified 80/20 train/test split.
- We ran a 500-row sample from IEEE-CIS through the live upload pipeline as an end-to-end demonstration. This proves the pipeline works correctly on real transactions; it does not prove held-out generalization, since we can't guarantee zero overlap with the training set. Our real validation numbers are the 80/20 split metrics above.

## Architecture

- **Backend:** Flask, deployed on Render, MongoDB Atlas for storage, JWT for auth.
- **Frontend:** React (Vite) + Tailwind, deployed as a static site on Render.
- **Security:** CORS locked to the frontend origin, rate limiting (200/hour global, 30/minute on `/predict`), debug mode off in production.
- **ML:** scikit-learn (Random Forest, Isolation Forest), XGBoost, One-Class SVM, SHAP.

## Running it locally

```bash
pip install -r requirements.txt
python app.py
```
You'll need a `.env` with `MONGO_URI` and `JWT_SECRET`. Frontend lives in `client/` — standard Vite commands (`npm install`, `npm run dev`).

## Next up

Training the XGBoost pipeline on the full IEEE-CIS dataset rather than a 400K subset, to close the precision gap with the RF/IF model.
