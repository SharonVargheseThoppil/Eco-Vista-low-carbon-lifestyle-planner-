require('dotenv').config(); // Ensure this is the first line in app.js

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const authRoutes = require('./routes/auth'); // Adjust path as needed

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse JSON data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

app.use(session({
    secret: process.env.SESSION_SECRET, // Use a secure session secret from your .env file
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

// Global Variables Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.session.user || null;
    next();
});

// Routes
app.use('/auth', authRoutes); // Ensure this is correct and the file path is correct

// Serve the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Protect pages
app.get('/tracker.html', (req, res) => {
    if (!req.session.user) {
        req.flash('error_msg', 'Please log in to view this resource');
        return res.redirect('/'); // Redirect to home.html
    }
    res.sendFile(path.join(__dirname, 'public', 'tracker.html'));
});

app.get('/cal.html', (req, res) => {
    if (!req.session.user) {
        req.flash('error_msg', 'Please log in to view this resource');
        return res.redirect('/'); // Redirect to home.html
    }
    res.sendFile(path.join(__dirname, 'public', 'cal.html'));
});

// Check session status
app.get('/auth/check-session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
