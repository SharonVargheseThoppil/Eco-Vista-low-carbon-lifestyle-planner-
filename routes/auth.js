const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register Handle
router.post('/register', [
    check('username', 'Username is required').not().isEmpty(),
    check('name', 'Name is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
    check('password2', 'Confirm Password is required').not().isEmpty(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
    const { username, name, password, password2 } = req.body;
    const errors = validationResult(req);

    // Check if there are validation errors or if passwords don't match
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Please fill in all fields correctly.',
            errors: errors.array()
        });
    }

    if (password !== password2) {
        return res.status(400).json({
            success: false,
            message: 'Passwords do not match.'
        });
    }

    try {
        // Check if username already exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Username is already registered'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            name,
            username,
            password: hashedPassword
        });

        // Save user to the database
        await user.save();
        res.json({
            success: true,
            message: 'You are now registered and can log in'
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// Login Handle
router.post('/login', [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const { username, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Please fill in all fields correctly.',
            errors: errors.array()
        });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        req.session.user = {
            _id: user._id,
            username: user.username,
            name: user.name
        }; // Store minimal user data in session
        res.json({
            success: true,
            user: req.session.user
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({
                success: false,
                message: 'Logout failed. Please try again.'
            });
        }
        res.redirect('/'); // Redirect to home page on successful logout
    });
});

module.exports = router;
