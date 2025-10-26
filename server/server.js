import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------
// Middleware
// ---------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS only in development
if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Serve static uploads
app.use('/uploads', express.static(uploadsDir));

// ---------------------
// API Routes
// ---------------------
app.use('/api/auth', (await import('./routes/authRoutes.js')).default);
app.use('/api/users', (await import('./routes/userRoutes.js')).default);
app.use('/api/expenses', (await import('./routes/expenseRoutes.js')).default);
app.use('/api/sales', (await import('./routes/salesRoutes.js')).default);
app.use('/api/stockrequests', (await import('./routes/stockRoutes.js')).default);
app.use('/api/transport', (await import('./routes/transportRoutes.js')).default);
app.use('/api/reports', (await import('./routes/reportRoutes.js')).default);
app.use('/api/export', (await import('./routes/exportRoutes.js')).default);
app.use('/api/activity-logs', (await import('./routes/activityLogRoutes.js')).default);

app.use('/api/daily-report', (await import('./routes/dailyReportRoutes.js')).default);
app.use('/api/daily-store-images', (await import('./routes/dailyStoreImageRoutes.js')).default);



// Health check
app.get('/api/auth/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Server is running',
  });
});

// ---------------------
// Serve React Frontend for all non-API routes
// ---------------------
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ---------------------
// Error Handling
// ---------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 Handler for undefined API routes

// ---------------------
// Connect MongoDB and Start Server
// ---------------------
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopManagement')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });


