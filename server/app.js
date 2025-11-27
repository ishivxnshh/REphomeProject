const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rephome';

console.log('Attempting to connect to MongoDB...');
console.log('Connection URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials if present

mongoose
    .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    })
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        console.log('Database:', mongoose.connection.db.databaseName);
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        console.error('\nTroubleshooting tips:');
        
        // Check if using MongoDB Atlas
        if (MONGODB_URI.includes('mongodb+srv://') || MONGODB_URI.includes('mongodb.net')) {
            console.error('🔍 Detected MongoDB Atlas connection');
            console.error('1. Your IP address may not be whitelisted');
            console.error('   - Go to: https://cloud.mongodb.com/');
            console.error('   - Click "Network Access" → "Add IP Address"');
            console.error('   - Click "Add Current IP Address" or use "0.0.0.0/0" (less secure)');
            console.error('2. Check your Atlas username and password in .env');
            console.error('3. Verify the database name in connection string');
            console.error('4. Wait 1-2 minutes after whitelisting IP');
        } else {
            console.error('🔍 Detected local MongoDB connection');
            console.error('1. Make sure MongoDB is running on your system');
            console.error('2. Check if MongoDB is installed: mongod --version');
            console.error('3. Try starting MongoDB service:');
            console.error('   - Windows: net start MongoDB (or check Services)');
            console.error('   - Mac/Linux: sudo systemctl start mongod');
            console.error('4. Verify connection string in .env file:');
            console.error('   MONGODB_URI=mongodb://127.0.0.1:27017/rephome');
            console.error('5. Check if port 27017 is not blocked by firewall');
        }
        console.error('\n💡 Run "node src/utils/testMongoDB.js" to test connection');
        process.exit(1); // Exit if MongoDB connection fails
    });

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/bookings', require('./src/routes/booking.routes'));
app.use('/api/shops', require('./src/routes/shop.routes'));

// Auto-approve bookings background job (runs every minute)
const Booking = require('./src/models/Booking');
setInterval(async () => {
    try {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
        
        const result = await Booking.updateMany(
            { 
                status: 'pending',
                createdAt: { $lte: twoMinutesAgo }
            },
            { 
                status: 'confirmed'
            }
        );
        
        if (result.modifiedCount > 0) {
            console.log(`[Auto-approve] Approved ${result.modifiedCount} booking(s)`);
        }
    } catch (error) {
        console.error('[Auto-approve] Error:', error);
    }
}, 60000); // Run every 60 seconds (1 minute)

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Server error' });
});

module.exports = app;


