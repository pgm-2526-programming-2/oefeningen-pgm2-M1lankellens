/**
 * @fileoverview Express routes voor playlists resource
 * @module routes/playlists
 */

const express = require('express');
const router = express.Router();
const {
  getAllPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  patchPlaylist,
  deletePlaylist
} = require('../controllers/playlists.controller');

/**
 * @route GET /api/playlists
 * @description Haalt alle playlists op, optioneel gesorteerd
 * @query {string} [sort] - Sorteerrichting ('asc' of 'desc')
 * @returns {Object} JSON met success, data array en count
 */
router.get('/', getAllPlaylists);

/**
 * @route GET /api/playlists/:id
 * @description Haalt een specifieke playlist op via ID
 * @param {string} id - Playlist ID
 * @returns {Object} JSON met playlist data of leeg object bij 404
 */
router.get('/:id', getPlaylistById);

/**
 * @route POST /api/playlists
 * @description Maakt een nieuwe playlist aan
 * @body {Object} playlist - Playlist object (naam, beschrijving, author, visibility verplicht)
 * @returns {Object} JSON met nieuwe playlist (201) of error (400)
 */
router.post('/', createPlaylist);

/**
 * @route PUT /api/playlists/:id
 * @description Update een volledige playlist (alle velden verplicht + id in body)
 * @param {string} id - Playlist ID
 * @body {Object} playlist - Volledige playlist object inclusief id
 * @returns {Object} JSON met geüpdatete playlist of error
 */
router.put('/:id', updatePlaylist);

/**
 * @route PATCH /api/playlists/:id
 * @description Update specifieke velden van een playlist
 * @param {string} id - Playlist ID
 * @body {Object} fields - Velden om te updaten
 * @returns {Object} JSON met geüpdatete playlist of leeg object bij 404
 */
router.patch('/:id', patchPlaylist);

/**
 * @route DELETE /api/playlists/:id
 * @description Verwijdert een playlist
 * @param {string} id - Playlist ID
 * @returns {Object} JSON met verwijderde playlist of leeg object bij 404
 */
router.delete('/:id', deletePlaylist);

module.exports = router;