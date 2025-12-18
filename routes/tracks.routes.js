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

router.get('/', getAllTracks);
router.get('/:id', getTrackById);
router.post('/', createTrack);
router.put('/:id', updateTrack);
router.patch('/:id', patchTrack);
router.delete('/:id', deleteTrack);

module.exports = router;
