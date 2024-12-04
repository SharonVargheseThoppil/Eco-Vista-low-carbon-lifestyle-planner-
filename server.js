const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS if your frontend and backend are on different domains

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/carbonFootprintDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('MongoDB connection error:', err));

// Define a schema and model
const recordSchema = new mongoose.Schema({
    username: String,
    transport: String,
    miles: Number,
    electricity: Number,
    waste: Number,
    carbonFootprint: Number,
    timestamp: { type: Date, default: Date.now }
});

const Record = mongoose.model('Record', recordSchema);

// API route to handle form submission
app.post('/submit', async (req, res) => {
    try {
        const record = new Record(req.body);
        await record.save();
        res.status(201).json({ message: 'Data saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
