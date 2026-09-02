const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    Amount: Number,
    isFraud: Boolean,
    riskScore: Number,
    timestamp: { type: Date, default: Date.now }
}, { strict: false });

// The third argument MUST match your collection name: 'predictions'
module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema, 'predictions');