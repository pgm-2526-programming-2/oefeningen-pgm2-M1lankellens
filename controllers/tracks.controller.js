/**
 * @fileoverview Controller voor tracks resource
 * @module controllers/tracks
 */

const fs = require('fs').promises;
const path = require('path');
const Joi = require('joi');

const tracksFilePath = path.join(__dirname, '../models/tracks.json');

/**
 * Joi validatie schema voor het aanmaken van een track (POST)
 * @type {Joi.ObjectSchema}
 */
const trackSchemaCreate = Joi.object({
  naam: Joi.string().required(),
  bpm: Joi.number().integer().required(),
  duur: Joi.number().integer().required(),
  jaar: Joi.number().integer().required(),
  artiesten: Joi.array().items(Joi.string()).required(),
  genres: Joi.array().items(Joi.string()).required(),
  spotify_url: Joi.string().allow('').optional()
});

/**
 * Joi validatie schema voor het updaten van een track (PUT)
 * @type {Joi.ObjectSchema}
 */
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

/**
 * Leest alle tracks uit het JSON bestand
 * @async
 * @returns {Promise<Array>} Array van track objecten
 */
const readTracks = async () => {
  try {
    const data = await fs.readFile(tracksFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

/**
 * Schrijft tracks array naar het JSON bestand
 * @async
 * @param {Array} tracks - Array van track objecten
 * @returns {Promise<void>}
 */
const writeTracks = async (tracks) => {
  await fs.writeFile(tracksFilePath, JSON.stringify(tracks, null, 2));
};

/**
 * Zoekt de index van een track in de array op basis van ID
 * @param {Array} tracks - Array van track objecten
 * @param {string|number} id - Track ID
 * @returns {number} Index van de track, of -1 als niet gevonden
 */
const findTrackIndex = (tracks, id) => {
  return tracks.findIndex(t => t.id === parseInt(id));
};

/**
 * Haalt alle tracks op met optionele filtering en sorting
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.sort] - Sorteerrichting ('asc' of 'desc')
 * @param {string} [req.query.naam] - Filter op naam (case-insensitive)
 * @param {string} [req.query.artiest] - Filter op artiest (case-insensitive)
 * @param {string} [req.query.genre] - Filter op genre (case-insensitive)
 * @param {string} [req.query.jaar] - Filter op jaar
 * @param {Object} res - Express response object
 * @returns {Object} JSON response met tracks array en count
 */
const getAllTracks = async (req, res) => {
  try {
    let tracks = await readTracks();
    const { sort, naam, artiest, genre, jaar } = req.query;

    // Filter op naam
    if (naam) {
      tracks = tracks.filter(t => t.naam.toLowerCase().includes(naam.toLowerCase()));
    }

    // Filter op artiest
    if (artiest) {
      tracks = tracks.filter(t =>
        t.artiesten.some(a => a.toLowerCase().includes(artiest.toLowerCase()))
      );
    }

    // Filter op genre
    if (genre) {
      tracks = tracks.filter(t =>
        t.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
      );
    }

    // Filter op jaar
    if (jaar) {
      tracks = tracks.filter(t => t.jaar === parseInt(jaar));
    }

    // Sorteren
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

/**
 * Haalt een specifieke track op via ID
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Track ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response met track data of leeg object bij 404
 */
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

/**
 * Maakt een nieuwe track aan met Joi validatie
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body met track data
 * @param {string} req.body.naam - Naam van de track
 * @param {number} req.body.bpm - Beats per minute
 * @param {number} req.body.duur - Duur in seconden
 * @param {number} req.body.jaar - Jaar van uitgave
 * @param {string[]} req.body.artiesten - Array van artiesten
 * @param {string[]} req.body.genres - Array van genres
 * @param {string} [req.body.spotify_url] - Spotify URL (optioneel)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response met nieuwe track of error
 */
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

/**
 * Update een volledige track met Joi validatie (id verplicht in body)
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Track ID
 * @param {Object} req.body - Request body met alle track velden
 * @param {number} req.body.id - Track ID (verplicht in body)
 * @param {string} req.body.naam - Naam van de track
 * @param {number} req.body.bpm - Beats per minute
 * @param {number} req.body.duur - Duur in seconden
 * @param {number} req.body.jaar - Jaar van uitgave
 * @param {string[]} req.body.artiesten - Array van artiesten
 * @param {string[]} req.body.genres - Array van genres
 * @param {string} [req.body.spotify_url] - Spotify URL (optioneel)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response met geüpdatete track of error
 */
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

/**
 * Update specifieke velden van een track (PATCH)
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Track ID
 * @param {Object} req.body - Request body met velden om te updaten
 * @param {string} [req.body.naam] - Naam van de track
 * @param {number} [req.body.bpm] - Beats per minute
 * @param {number} [req.body.duur] - Duur in seconden
 * @param {number} [req.body.jaar] - Jaar van uitgave
 * @param {string[]} [req.body.artiesten] - Array van artiesten
 * @param {string[]} [req.body.genres] - Array van genres
 * @param {string} [req.body.spotify_url] - Spotify URL
 * @param {Object} res - Express response object
 * @returns {Object} JSON response met geüpdatete track of error
 */
const patchTrack = async (req, res) => {
  try {
    const tracks = await readTracks();
    const trackIndex = findTrackIndex(tracks, req.params.id);

    if (trackIndex === -1) {
      return res.status(404).json({});
    }

    const updatedTrack = { ...tracks[trackIndex] };
    const { naam, bpm, duur, jaar, artiesten, genres, spotify_url } = req.body;

    if (naam) {updatedTrack.naam = naam;}
    if (bpm) {updatedTrack.bpm = bpm;}
    if (duur) {updatedTrack.duur = duur;}
    if (jaar) {updatedTrack.jaar = jaar;}
    if (artiesten) {updatedTrack.artiesten = artiesten;}
    if (genres) {updatedTrack.genres = genres;}
    if (spotify_url !== undefined) {updatedTrack.spotify_url = spotify_url;}

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

/**
 * Verwijdert een track uit de database
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Track ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response met verwijderde track of leeg object bij 404
 */
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