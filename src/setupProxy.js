const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://23.254.230.47:5003',
      changeOrigin: true,
    })
  );
};