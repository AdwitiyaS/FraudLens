const express = require('express');
const router = express.Router();
const axios = require('axios');
const passport = require('passport');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');
const FLASK = 'http://127.0.0.1:5001';

const uploadDir = path.join(os.tmpdir(), 'neuralguard-uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
    })
});

const getUserId = (req) => req.user ? req.user._id.toString() : 'anonymous';

router.get('/transactions', async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/history?userId=${getUserId(req)}`);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Flask offline' });
    }
});

// --- Auth API Endpoints for React ---

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: info.message || 'Invalid credentials' });
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
        });
    })(req, res, next);
});

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const User = require('../models/user');
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const user = await User.create({ name, email, password });
        return res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create account' });
    }
});

router.get('/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

router.post('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.json({ success: true });
    });
});

// --- Google OAuth ---
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/login',
    failureFlash: true
}), (req, res) => {
    // Successful authentication, redirect to React dashboard
    res.redirect('http://localhost:5173/dashboard');
});


// ------------------------------------

router.get('/stats', async (req, res) => {
    try {
        const uid = getUserId(req);
        console.log(`[STATS] userId=${uid}, url=${FLASK}/api/stats?userId=${uid}`);
        const r = await axios.get(`${FLASK}/api/stats?userId=${uid}`);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Flask offline' });
    }
});

router.get('/analytics', async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/api/analytics?userId=${getUserId(req)}`);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Flask offline' });
    }
});

router.get('/model-stats', async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/api/model-stats?userId=${getUserId(req)}`);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Flask offline' });
    }
});

router.get('/transactions-page', async (req, res) => {
    try {
        const { page, limit, filter } = req.query;
        const r = await axios.get(
            `${FLASK}/api/transactions-page?userId=${getUserId(req)}&page=${page}&limit=${limit}&filter=${filter}`
        );
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Flask offline' });
    }
});

router.post('/shap', async (req, res) => {
    try {
        const r = await axios.post(`${FLASK}/api/shap`, req.body);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'SHAP service unavailable. Is Flask running?' });
    }
});

router.post('/shap-proxy', async (req, res) => {
    try {
        const r = await axios.post(`${FLASK}/api/shap`, req.body);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'SHAP service unavailable. Is Flask running?' });
    }
});

router.get('/cases', async (req, res) => {
    try {
        const r = await axios.get(`${FLASK}/api/cases?userId=${getUserId(req)}`);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Flask offline' });
    }
});

router.post('/cases/:id/review', async (req, res) => {
    try {
        const r = await axios.post(
            `${FLASK}/api/cases/${req.params.id}/review?userId=${getUserId(req)}`, req.body
        );
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Review failed' });
    }
});

router.post('/case-review/:id', async (req, res) => {
    try {
        const r = await axios.post(
            `${FLASK}/api/cases/${req.params.id}/review`, req.body
        );
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: 'Review failed' });
    }
});

router.post('/upload-dataset', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file received.' });
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(req.file.path), {
            filename: req.file.originalname || 'upload.csv',
            contentType: 'text/csv'
        });
        form.append('userId', getUserId(req));
        const response = await axios.post(`${FLASK}/api/upload-dataset`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 0 // Do not timeout from BFF layer
        });
        res.json(response.data);
    } catch (err) {
        const msg = err.response?.data?.error || err.message || 'Upload failed';
        console.error('Upload error:', msg);
        res.status(500).json({ error: msg });
    } finally {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error("Failed to delete temp file:", e);
            }
        }
    }
});

module.exports = router;