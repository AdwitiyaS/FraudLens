require('dotenv').config({ path: './.env' });

console.log("MONGO URI:", process.env.MONGO_URI);

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Atlas Connected ✓"))
    .catch(err => console.log("Mongo Error:", err));

const express = require('express');
const axios = require('axios');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

require('./config/passport')(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'neuralguard_secret_2024',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use('/', authRoutes);
app.use('/api', apiRoutes);

// ── Existing Pages ────────────────────────────────────────────────────────────

app.get('/alerts', async (req, res) => {
    try {
        const response = await axios.get('http://127.0.0.1:5001/history');
        const anomalies = response.data.filter(tx => tx.is_fraud === 1);
        res.render('alerts', { alerts: anomalies });
    } catch (err) {
        console.error("Failed to fetch alerts:", err.message);
        res.render('alerts', { alerts: [] });
    }
});

app.get('/transactions', async (req, res) => {
    try {
        const response = await axios.get('http://127.0.0.1:5001/history');
        res.render('transactions', { transactions: response.data });
    } catch (err) {
        res.render('transactions', { transactions: [] });
    }
});

// ── New Pages ─────────────────────────────────────────────────────────────────

// Analytics tab
app.get('/analytics', async (req, res) => {
    try {
        const response = await axios.get('http://127.0.0.1:5001/api/analytics');
        res.render('analytics', { data: response.data });
    } catch (err) {
        console.error("Analytics fetch failed:", err.message);
        res.render('analytics', { data: {} });
    }
});

// Model Performance tab
app.get('/model-stats', async (req, res) => {
    try {
        const response = await axios.get('http://127.0.0.1:5001/api/model-stats');
        res.render('model_stats', { stats: response.data });
    } catch (err) {
        console.error("Model stats fetch failed:", err.message);
        res.render('model_stats', { stats: {} });
    }
});

// SHAP Explainer tab
app.get('/shap', (req, res) => {
    res.render('shap');
});

// Case Review tab
app.get('/cases', async (req, res) => {
    try {
        const response = await axios.get('http://127.0.0.1:5001/api/cases');
        res.render('cases', { cases: response.data });
    } catch (err) {
        console.error("Cases fetch failed:", err.message);
        res.render('cases', { cases: [] });
    }
});

app.listen(5000, () => console.log("NeuralGuard running → http://localhost:5000"));

// ── Proxy routes (bridge EJS → Flask) ────────────────────────────────────────

app.post('/api/shap-proxy', async (req, res) => {
    try {
        const response = await axios.post('http://127.0.0.1:5001/api/shap', req.body);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'SHAP service unavailable. Is Flask running?' });
    }
});

app.post('/api/case-review/:id', async (req, res) => {
    try {
        const response = await axios.post(
            `http://127.0.0.1:5001/api/cases/${req.params.id}/review`, req.body
        );
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Review failed.' });
    }
});