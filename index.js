/**
 * @fileoverview Mockify API - Hoofdbestand
 * @description Express server setup en configuratie voor de Mockify REST API
 * @author Milan Kellens
 * @version 1.0.0
 */

const express = require('express');
const tracksRouter = require('./routes/tracks.routes');
const playlistsRouter = require('./routes/playlists.routes');

/**
 * Express applicatie instance
 * @type {Express}
 */
const app = express();

/**
 * Server poort (uit environment of default 3000)
 * @type {number}
 */
const port = process.env.PORT || 3000;

/**
 * Middleware voor JSON request body parsing
 */
app.use(express.json());

/**
 * Middleware voor URL-encoded request body parsing
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Routes voor tracks resource
 * @name /api/tracks
 */
app.use('/api/tracks', tracksRouter);

/**
 * Routes voor playlists resource
 * @name /api/playlists
 */
app.use('/api/playlists', playlistsRouter);

/**
 * @route GET /
 * @description Root endpoint met API informatie
 * @returns {Object} JSON met welkomstbericht, versie en beschikbare endpoints
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Mockify API',
    version: '1.0.0',
    endpoints: {
      tracks: '/api/tracks',
      playlists: '/api/playlists'
    }
  });
});

/**
 * 404 Not Found handler
 * @description Vangt alle niet-bestaande routes op
 * @returns {Object} JSON met error bericht en status 404
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/**
 * Global error handler
 * @description Vangt alle onverwachte errors op
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware functie
 * @returns {Object} JSON met error bericht en status 500
 */
app.use((error, req, res, next) => {
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

/**
 * Start de Express server
 */
app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});

module.exports = app;