// Vercel serverless function entrypoint
const appModule = require('../backend/dist/index.js');
const app = appModule.default || appModule.app || appModule;

module.exports = app;
