const express = require('express');
const router = express.Router();
const passport = require('passport');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const User = require('../models/user');

const FLASK = 'http://127.0.0.1:5001';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }
});

function ensureGuest(req, res, next) {
    if (req.isAuthenticated()) return res.redirect('/dashboard');
    next();
}
function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// ── Auth Pages ────────────────────────────────────────────────────────────────
router.get('/', (req, res) => res.redirect('/login'));
router.get('/login', ensureGuest, (req, res) => res.render('login', { error: req.flash('error') }));
router.get('/signup', ensureGuest, (req, res) => res.render('signup', { error: req.flash('error') }));

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

router.post('/signup', ensureGuest, async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
        req.flash('error', 'Email already registered');
        return res.redirect('/signup');
    }
    await User.create({ name, email, password });
    req.flash('error', 'Account created! Please log in.');
    res.redirect('/login');
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', ensureAuth, (req, res) => {
    res.render('dashboard', { user: req.user });
});

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

// ── Logout ────────────────────────────────────────────────────────────────────
router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/login');
    });
});

// ── Transactions ──────────────────────────────────────────────────────────────
router.get('/transactions', ensureAuth, async (req, res) => {
    try {
        const response = await axios.get(`${FLASK}/history`);
        console.log('COUNT:', response.data.length);
        res.render('transactions', { transactions: response.data });
    } catch (err) {
        console.error('Transactions error:', err.message);
        res.render('transactions', { transactions: [] });
    }
});

// ── Alerts ────────────────────────────────────────────────────────────────────
router.get('/alerts', ensureAuth, async (req, res) => {
    try {
        const response = await axios.get(`${FLASK}/history`);
        const anomalies = response.data.filter(tx => tx.is_fraud === 1);
        console.log('ALERTS COUNT:', anomalies.length);
        res.render('alerts', { alerts: anomalies });
    } catch (err) {
        console.error('Alerts error:', err.message);
        res.render('alerts', { alerts: [] });
    }
});


// ── New Pages ─────────────────────────────────────────────────────────────────
router.get('/analytics', ensureAuth, async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/api/analytics`);
        res.render('analytics', { data: r.data });
    } catch (err) { res.render('analytics', { data: {} }); }
});

router.get('/model-stats', ensureAuth, async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/api/model-stats`);
        res.render('model_stats', { stats: r.data });
    } catch (err) { res.render('model_stats', { stats: {} }); }
});

router.get('/shap', ensureAuth, (req, res) => res.render('shap'));
router.get('/cases', ensureAuth, async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/api/cases`);
        res.render('cases', { cases: r.data });
    } catch (err) { res.render('cases', { cases: [] }); }
});

// ── Upload ────────────────────────────────────────────────────────────────────
router.get('/upload', ensureAuth, (req, res) => {
    res.render('upload', { user: req.user });
});

router.post('/upload', ensureAuth, upload.single('csvFile'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file received.' });
    try {
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname || 'upload.csv',
            contentType: 'text/csv'
        });
        form.append('userId', req.user._id.toString());
        const response = await axios.post(`${FLASK}/api/upload-dataset`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 300000
        });
        res.json(response.data);
    } catch (err) {
        const msg = err.response?.data?.error || err.message || 'Upload failed';
        console.error('Upload error:', msg);
        res.status(500).json({ error: msg });
    }
});

module.exports = router;