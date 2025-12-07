import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jobsRouter from './routes/jobs.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Routes
app.use('/api', jobsRouter);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, HOST, () => {
    console.log(`\n🚀 Job Scraper API Server running on http://${HOST}:${PORT}`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   GET  http://${HOST}:${PORT}/api/health`);
    console.log(`   GET  http://${HOST}:${PORT}/api/platforms`);
    console.log(`   POST http://${HOST}:${PORT}/api/linkedin/jobs/search`);
    console.log(`\n✨ Ready to accept requests!\n`);
});

export default app;
