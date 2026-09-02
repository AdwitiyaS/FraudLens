const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// 🔐 Hash password before saving
// REMOVED 'next' from the arguments
userSchema.pre('save', async function () {
    try {
        // Skip if no password (Google user) or if password not modified
        if (!this.password || !this.isModified('password')) {
            return; // Just return, don't call next()
        }

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);

        // No next() call here
    } catch (err) {
        throw err; // Throw the error instead of calling next(err)
    }
});


module.exports = mongoose.models.User || mongoose.model('User', userSchema);