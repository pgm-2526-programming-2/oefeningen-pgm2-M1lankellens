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

router.get('/', getAllPlaylists);
router.get('/:id', getPlaylistById);
router.post('/', createPlaylist);
router.put('/:id', updatePlaylist);
router.patch('/:id', patchPlaylist);
router.delete('/:id', deletePlaylist);

module.exports = router;
