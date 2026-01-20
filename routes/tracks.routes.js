/**
 * @fileoverview Express routes voor tracks resource
 * @module routes/tracks
 */

const express = require('express');
const router = express.Router();
const {
  getAllTracks,
  getTrackById,
  createTrack,
  updateTrack,
  patchTrack,
  deleteTrack
} = require('../controllers/tracks.controller');

/**
 * @route GET /api/tracks
 * @description Haalt alle tracks op, optioneel gesorteerd
 * @query {string} [sort] - Sorteerrichting ('asc' of 'desc')
 * @returns {Object} JSON met success, data array en count
 */
router.get('/', getAllTracks);

/**
 * @route GET /api/tracks/:id
 * @description Haalt een specifieke track op via ID
 * @param {string} id - Track ID
 * @returns {Object} JSON met track data of leeg object bij 404
 */
router.get('/:id', getTrackById);

/**
 * @route POST /api/tracks
 * @description Maakt een nieuwe track aan
 * @body {Object} track - Track object (naam, bpm, duur, jaar, artiesten, genres verplicht)
 * @returns {Object} JSON met nieuwe track (201) of error (400)
 */
router.post('/', createTrack);

/**
 * @route PUT /api/tracks/:id
 * @description Update een volledige track (alle velden verplicht + id in body)
 * @param {string} id - Track ID
 * @body {Object} track - Volledige track object inclusief id
 * @returns {Object} JSON met geüpdatete track of error
 */
router.put('/:id', updateTrack);

/**
 * @route PATCH /api/tracks/:id
 * @description Update specifieke velden van een track
 * @param {string} id - Track ID
 * @body {Object} fields - Velden om te updaten
 * @returns {Object} JSON met geüpdatete track of leeg object bij 404
 */
router.patch('/:id', patchTrack);

/**
 * @route DELETE /api/tracks/:id
 * @description Verwijdert een track
 * @param {string} id - Track ID
 * @returns {Object} JSON met verwijderde track of leeg object bij 404
 */
router.delete('/:id', deleteTrack);

module.exports = router;