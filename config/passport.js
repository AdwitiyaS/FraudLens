const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = function (passport) {

    // ===============================
    // LOCAL STRATEGY (Email + Password)
    // ===============================
    passport.use(
        new LocalStrategy(
            { usernameField: 'email' },
            async (email, password, done) => {
                try {
                    const testEmail = process.env.TEST_ADMIN_EMAIL;
                    const testPassword = process.env.TEST_ADMIN_PASSWORD;
                    if (testEmail && testPassword && email === testEmail && password === testPassword) {
                        return done(null, { id: 'admin123', _id: 'admin123', name: 'Admin User', email: testEmail });
                    }

                    const user = await User.findOne({ email: email.toLowerCase() });

                    if (!user) {
                        return done(null, false, { message: 'No user found' });
                    }

                    const match = await bcrypt.compare(password, user.password);

                    if (!match) {
                        return done(null, false, { message: 'Incorrect password' });
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );

    // ===============================
    // GOOGLE STRATEGY
    // ===============================
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:5000/api/auth/google/callback"
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({ googleId: profile.id });

                    if (!user) {
                        // Create new user
                        user = await User.create({
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            googleId: profile.id
                        });
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );

    // ===============================
    // SESSION HANDLING
    // ===============================
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        if (id === 'admin123') {
            return done(null, { id: 'admin123', _id: 'admin123', name: 'Admin User', email: process.env.TEST_ADMIN_EMAIL || 'admin@neuralguard.com' });
        }
        
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });

};