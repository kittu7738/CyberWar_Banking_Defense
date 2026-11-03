const { createApp } = require('../server/dist/app.js');

const app = createApp();

module.exports = (req, res) => {
  // Ensure req.url retains the /api prefix expected by the Express router
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
