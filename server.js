const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable gzip compression for faster loading
app.use(compression());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Set proper CORS headers for Telegram
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// API proxy (optional - only needed if your backend isn't separate)
// app.use('/api', createProxyMiddleware({
//   target: 'https://qserver-ii0a.onrender.com',
//   changeOrigin: true,
//   pathRewrite: {'^/api': '/api'}
// }));

// For any other route, serve the index.html file (SPA routing)
app.get('*', (req, res, next) => {
  // Important: Don't attempt to send headers multiple times
  if (!res.headersSent) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    next();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!res.headersSent) {
    res.status(500).send('Something broke!');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 