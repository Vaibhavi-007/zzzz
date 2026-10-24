const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB, getStatus } = require('./config/db');

const participantRoutes = require('./routes/participantRoutes');
const stimulusRoutes = require('./routes/stimulusRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

// Static stimuli assets
app.use('/stimuli', express.static(path.join(__dirname, 'public/stimuli')));

// API Routes
app.use('/api/participants', participantRoutes);
app.use('/api/stimuli', stimulusRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);

// System Health & Diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Affective Negotiation Task API',
    mongoConnected: getStatus(),
    timestamp: new Date().toISOString()
  });
});

// Serve client static build if present
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// Fallback for SPA routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/stimuli')) {
    return res.sendFile(path.join(clientDist, 'index.html'));
  }
  next();
});

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[API Server] Running on http://localhost:${PORT}`);
    console.log(`[API Server] MongoDB status: ${getStatus() ? 'Connected' : 'Using resilient fallback store'}`);
  });
};

startServer();
