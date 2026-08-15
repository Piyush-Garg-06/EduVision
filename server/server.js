const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('CRITICAL: MONGO_URI is missing from .env');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => {
    console.error('MongoDB connection failure:', err.message);
    process.exit(1);
  });

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/academic', require('./routes/academic'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ai', require('./routes/ai'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'AI-Powered Academic Monitoring API is running.' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
