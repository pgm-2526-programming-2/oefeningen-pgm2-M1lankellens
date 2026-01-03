const fs = require('fs').promises;
const path = require('path');
const Joi = require('joi');

const tracksFilePath = path.join(__dirname, '../models/tracks.json');

// Joi schema voor POST
const trackSchemaCreate = Joi.object({
  naam: Joi.string().required(),
  bpm: Joi.number().integer().required(),
  duur: Joi.number().integer().required(),
  jaar: Joi.number().integer().required(),
  artiesten: Joi.array().items(Joi.string()).required(),
  genres: Joi.array().items(Joi.string()).required(),
  spotify_url: Joi.string().allow('').optional()
});

// Joi schema voor PUT
const trackSchemaUpdate = Joi.object({
  id: Joi.number().integer().required(),
  naam: Joi.string().required(),
  bpm: Joi.number().integer().required(),
  duur: Joi.number().integer().required(),
  jaar: Joi.number().integer().required(),
  artiesten: Joi.array().items(Joi.string()).required(),
  genres: Joi.array().items(Joi.string()).required(),
  spotify_url: Joi.string().allow('').optional()
});

// Lees alle tracks uit de JSON
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

// Zoekt array index van een track op basis van ID
const findTrackIndex = (tracks, id) => {
  return tracks.findIndex(t => t.id === parseInt(id));
};

// Haal alle tracks op met optionele sorting
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

// Haal specifieke track op via ID, geeft 404 met leeg object als niet gevonden
const getTrackById = async (req, res) => {
  try {
    const tracks = await readTracks();
    const track = tracks.find(t => t.id === parseInt(req.params.id));
    
    if (!track) {
      return res.status(404).json({});
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

// Maak een nieuwe track aan met Joi validatie
const createTrack = async (req, res) => {
  try {
    const { error } = trackSchemaCreate.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }

    const tracks = await readTracks();
    const newId = tracks.length > 0 ? Math.max(...tracks.map(t => t.id)) + 1 : 1;
    
    const newTrack = {
      id: newId,
      naam: req.body.naam,
      bpm: req.body.bpm,
      duur: req.body.duur,
      jaar: req.body.jaar,
      artiesten: req.body.artiesten,
      genres: req.body.genres,
      spotify_url: req.body.spotify_url || ''
    };
    
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

// Update een volledige track met Joi validatie (id verplicht in body)
const updateTrack = async (req, res) => {
  try {
    const { error } = trackSchemaUpdate.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }

    const tracks = await readTracks();
    const trackIndex = findTrackIndex(tracks, req.params.id);
    
    if (trackIndex === -1) {
      return res.status(404).json({});
    }
    
    const updatedTrack = {
      id: parseInt(req.params.id),
      naam: req.body.naam,
      bpm: req.body.bpm,
      duur: req.body.duur,
      jaar: req.body.jaar,
      artiesten: req.body.artiesten,
      genres: req.body.genres,
      spotify_url: req.body.spotify_url || ''
    };
    
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
      return res.status(404).json({});
    }
    
    const updatedTrack = { ...tracks[trackIndex] };
    const { naam, bpm, duur, jaar, artiesten, genres, spotify_url } = req.body;
    
    if (naam) updatedTrack.naam = naam;
    if (bpm) updatedTrack.bpm = bpm;
    if (duur) updatedTrack.duur = duur;
    if (jaar) updatedTrack.jaar = jaar;
    if (artiesten) updatedTrack.artiesten = artiesten;
    if (genres) updatedTrack.genres = genres;
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

// Verwijder track, geeft 404 met leeg object als niet gevonden
const deleteTrack = async (req, res) => {
  try {
    const tracks = await readTracks();
    const trackIndex = findTrackIndex(tracks, req.params.id);
    
    if (trackIndex === -1) {
      return res.status(404).json({});
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