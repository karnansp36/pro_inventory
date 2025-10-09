import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', (await import('./routes/authRoutes.js')).default);
app.use('/api/users', (await import('./routes/userRoutes.js')).default);
app.use('/api/expenses', (await import('./routes/expenseRoutes.js')).default);
app.use('/api/sales', (await import('./routes/salesRoutes.js')).default);
app.use('/api/stockrequests', (await import('./routes/stockRoutes.js')).default);
app.use('/api/transport', (await import('./routes/transportRoutes.js')).default);
app.use('/api/reports', (await import('./routes/reportRoutes.js')).default);
app.use('/api/export', (await import('./routes/exportRoutes.js')).default);
app.use('/api/activity-logs', (await import('./routes/activityLogRoutes.js')).default);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.get('/api/auth/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Server is running' 
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shop-management')
.then(() => {
  console.log('MongoDB Connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});