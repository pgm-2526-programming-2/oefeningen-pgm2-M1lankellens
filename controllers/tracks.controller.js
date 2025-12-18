const fs = require('fs').promises;
const path = require('path');

const tracksFilePath = path.join(__dirname, '../models/tracks.json');

// Lees alle tracks uit de JSON, geeft lege array terug bij fout
const readTracks = async () => {
  try {
    const data = await fs.readFile(tracksFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Schrijf tracks array naar het JSON bestand
const writeTracks = async (tracks) => {
  await fs.writeFile(tracksFilePath, JSON.stringify(tracks, null, 2));
};

// Controleert of alle verplichte velden aanwezig zijn
const validateRequiredFields = (body) => {
  const { naam, bpm, duur, jaar, artiesten, genres } = body;
  return naam && bpm && duur && jaar && artiesten && genres;
};

// Maak een track object
const createTrackObject = (body, id = null) => {
  const { naam, bpm, duur, jaar, artiesten, genres, spotify_url } = body;
  return {
    ...(id && { id }),
    naam,
    bpm: parseInt(bpm),
    duur: parseInt(duur),
    jaar: parseInt(jaar),
    artiesten: Array.isArray(artiesten) ? artiesten : [artiesten],
    genres: Array.isArray(genres) ? genres : [genres],
    spotify_url: spotify_url || ''
  };
};

// Zoekt array index van een track op basis van ID
const findTrackIndex = (tracks, id) => {
  return tracks.findIndex(t => t.id === parseInt(id));
};

// Haal alle tracks op met optionele sorting, geeft JSON response met tracks array
const getAllTracks = async (req, res) => {
  try {
    let tracks = await readTracks();
    
    const { sort } = req.query;
    if (sort === 'asc') {
      tracks.sort((a, b) => a.naam.localeCompare(b.naam));
    } else if (sort === 'desc') {
      tracks.sort((a, b) => b.naam.localeCompare(a.naam));
    }
    
    res.json({
      success: true,
      data: tracks,
      count: tracks.length
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error retrieving tracks'
    });
  }
};

// Haal specifieke track op via ID, geeft 404 als niet gevonden
const getTrackById = async (req, res) => {
  try {
    const tracks = await readTracks();
    const track = tracks.find(t => t.id === parseInt(req.params.id));
    
    if (!track) {
      return res.status(404).json({
        success: false,
        message: `Track with id ${req.params.id} not found`
      });
    }
    
    res.json({
      success: true,
      data: track
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error retrieving track'
    });
  }
};

// Maak een nieuwe track aan, controleert eerst of alle velden aanwezig zijn
const createTrack = async (req, res) => {
  try {
    if (!validateRequiredFields(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: naam, bpm, duur, jaar, artiesten, genres'
      });
    }

    const tracks = await readTracks();
    const newId = tracks.length > 0 ? Math.max(...tracks.map(t => t.id)) + 1 : 1;
    const newTrack = createTrackObject(req.body, newId);
    
    tracks.push(newTrack);
    await writeTracks(tracks);
    
    res.status(201).json({
      success: true,
      data: newTrack
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error creating track'
    });
  }
};

// Update een volledige track, alle velden zijn verplicht
const updateTrack = async (req, res) => {
  try {
    if (!validateRequiredFields(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: naam, bpm, duur, jaar, artiesten, genres'
      });
    }

    const tracks = await readTracks();
    const trackIndex = findTrackIndex(tracks, req.params.id);
    
    if (trackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Track with id ${req.params.id} not found`
      });
    }
    
    const updatedTrack = createTrackObject(req.body, parseInt(req.params.id));
    tracks[trackIndex] = updatedTrack;
    await writeTracks(tracks);
    
    res.json({
      success: true,
      data: updatedTrack
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error updating track'
    });
  }
};

// Update specifieke velden van track, andere velden blijven ongewijzigd
const patchTrack = async (req, res) => {
  try {
    const tracks = await readTracks();
    const trackIndex = findTrackIndex(tracks, req.params.id);
    
    if (trackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Track with id ${req.params.id} not found`
      });
    }
    
    const updatedTrack = { ...tracks[trackIndex] };
    const { naam, bpm, duur, jaar, artiesten, genres, spotify_url } = req.body;
    
    if (naam) updatedTrack.naam = naam;
    if (bpm) updatedTrack.bpm = parseInt(bpm);
    if (duur) updatedTrack.duur = parseInt(duur);
    if (jaar) updatedTrack.jaar = parseInt(jaar);
    if (artiesten) updatedTrack.artiesten = Array.isArray(artiesten) ? artiesten : [artiesten];
    if (genres) updatedTrack.genres = Array.isArray(genres) ? genres : [genres];
    if (spotify_url !== undefined) updatedTrack.spotify_url = spotify_url;
    
    tracks[trackIndex] = updatedTrack;
    await writeTracks(tracks);
    
    res.json({
      success: true,
      data: updatedTrack
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error updating track'
    });
  }
};

// Verwijder track uit de database
const deleteTrack = async (req, res) => {
  try {
    const tracks = await readTracks();
    const trackIndex = findTrackIndex(tracks, req.params.id);
    
    if (trackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Track with id ${req.params.id} not found`
      });
    }
    
    const deletedTrack = tracks[trackIndex];
    tracks.splice(trackIndex, 1);
    await writeTracks(tracks);
    
    res.json({
      success: true,
      data: deletedTrack
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error deleting track'
    });
  }
};

module.exports = {
  getAllTracks,
  getTrackById,
  createTrack,
  updateTrack,
  patchTrack,
  deleteTrack
};