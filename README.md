# FraudLens

FraudLens is a fraud detection platform built for the Razorpay AI Buildathon (Track 2: AI Risk Manager). It flags risky transactions in real time, explains why a transaction was flagged, and routes decisions through an agentic layer that either auto-approves, holds for human review, or auto-blocks, with every decision logged to an audit trail.

Live app: https://fraudlens-app.onrender.com
Live API: https://fraudlens-d30p.onrender.com

## The problem

Merchants lose money to fraud in two directions at once. Missed fraud costs them the transaction. Over-flagging legitimate customers costs them trust and future business. Most detection systems report accuracy and stop there, which hides the second cost entirely. FraudLens tries to show both sides honestly: what fraud it actually caught, and what it estimates the false-positive friction cost, using the model's own measured precision rather than a made-up number.

## What it does

1. A transaction (or a batch of transactions via CSV upload) gets scored by a trained model.
2. The model's output (fraud probability, anomaly flag) is passed to a decision engine, which returns one of three actions: `AUTO_APPROVE`, `HOLD_FOR_REVIEW`, or `AUTO_BLOCK`, along with a plain-English reason.
3. Every decision is logged to MongoDB with a timestamp, so there's a full audit trail of what the system decided and why.
4. SHAP explainability shows which features drove a given prediction.
5. A cost-impact calculator estimates money saved from caught fraud (using real average transaction value) against an estimated false-positive cost (using the model's real measured precision, applied at an explicitly stated ₹500-per-flag assumption, not disguised as a measured number).

## The decision engine (the part we'd point you to first)

This is the piece we think matters most for this track. Fraud detection alone is a solved problem in the sense that plenty of models can output a probability. What's harder, and what the brief is actually asking for, is what a business does with that probability. FraudLens doesn't just classify a transaction as fraud or not. It decides an action, explains the reason in plain language, and writes it down. If a transaction's fraud probability is very high, it's auto-blocked. If it's very low and nothing looks anomalous, it's auto-approved. Everything in between goes to a human reviewer, with the reasoning attached. You can see the full history of these decisions on the Audit Trail page.

We also added a failure fallback: if model inference itself throws an error for any reason, the system doesn't crash and doesn't silently approve the transaction either. It routes to `HOLD_FOR_REVIEW` with a reason explaining that inference failed, so a person looks at it. Fail-safe, not fail-open.

## Models

We trained two different model pairs, and which one runs depends on how much data a user has uploaded:

- **Random Forest + Isolation Forest**, used for datasets of 200,000 rows or fewer. This is the stronger of the two: 94.1% precision, 80.6% recall, F1 of 86.8%, ROC-AUC of 95.3%, on a genuine 80/20 stratified held-out split.
- **XGBoost + One-Class SVM**, used for datasets larger than 200,000 rows. This one is meaningfully weaker (around 51% precision, 65% recall). It was trained on 400,000 of the roughly 590,000 rows in IEEE-CIS. The remaining ~190,000 rows were not used in training or in any formal evaluation, they're simply untouched, and we're not counting them as held-out validation data anywhere in this project.

We're being upfront that the second model is the weaker one. The reasoning for having it at all is that a business with a genuinely large transaction volume needs something that can run inference fast on a reduced feature set (80 features versus 202), and RF/IF wasn't built for that scale in our testing. If we had more time we'd want to close that precision gap, and we see it as the clearest next improvement rather than something to hide.

## Dataset

We used IEEE-CIS Fraud Detection data, which is real, anonymized transaction data (not synthetic), sourced from Vesta Corporation via Kaggle. We also evaluated PaySim as an alternative but dropped it deliberately: its feature schema didn't match what our trained model expects, and rather than force a comparison that wouldn't mean anything, we left it out.

## Honest metrics

Per the track's own bar, here's what we're reporting and what we're not:

- Accuracy, precision, recall, F1, and ROC-AUC above are from a real, stratified 80/20 train/test split, not cherry-picked.
- The cost-impact calculator separates two things explicitly: money saved (calculated from real data, frauds caught times real average transaction value) and estimated false-positive cost (calculated from the model's real measured precision, applied against an assumed ₹500 friction cost per false flag). That ₹500 figure is a stated assumption, not something we measured, and the app says so directly in its own API response.
- We also ran a 500-row sample from the IEEE-CIS transaction data through the live upload pipeline as a demonstration of the system working end-to-end on real data. We want to be precise about what this does and doesn't prove: it demonstrates the pipeline (upload, inference, decision logging, dashboard) working correctly on real transactions, but we can't guarantee none of those specific rows overlapped with the 400,000 used in training, so we're not calling it held-out validation. Our actual validation numbers are the 80/20 split metrics above.

## Architecture

- **Backend**: Flask, deployed on Render, MongoDB Atlas for storage, JWT for auth.
- **Frontend**: React (Vite) with Tailwind, deployed as a static site on Render.
- **Security**: CORS locked to the frontend origin, rate limiting (200 requests/hour globally, 30/minute on the prediction endpoint), debug mode off in production.
- **ML**: scikit-learn (Random Forest, Isolation Forest), XGBoost, One-Class SVM, SHAP for explainability.

The backend is currently one file. That was a deliberate speed tradeoff for the timeline of this build, not something we think is a good long-term structure. Splitting it into proper modules (auth, models, routes) is the first refactor we'd do with more time.

## Running it locally

```bash
pip install -r requirements.txt
python app.py
```

You'll need a `.env` file with `MONGO_URI` and `JWT_SECRET` set. The frontend lives in `client/` and runs with the usual Vite commands (`npm install`, `npm run dev`).

## What we'd build next

- Close the precision gap on the XGBoost/OCSVM path, likely by training on the full dataset rather than a subset.
- Split `app.py` into proper modules.
- Add a persistent rate-limit storage backend (currently in-memory, which resets on restart and doesn't scale past one server instance).
- Build a real hourly aggregation for the transaction volume chart once there's enough live data for it to be meaningful, rather than the illustrative pattern currently shown.