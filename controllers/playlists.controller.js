/**
 * @fileoverview Controller voor playlists resource
 * @module controllers/playlists
 */

const fs = require('fs').promises;
const path = require('path');
const Joi = require('joi');

const playlistsFilePath = path.join(__dirname, '../models/playlists.json');

/**
 * Joi validatie schema voor het aanmaken van een playlist (POST)
 * @type {Joi.ObjectSchema}
 */
const playlistSchemaCreate = Joi.object({
  naam: Joi.string().required(),
  beschrijving: Joi.string().required(),
  author: Joi.string().required(),
  visibility: Joi.string().valid('public', 'private').required(),
  spotify_url: Joi.string().allow('').optional()
});

/**
 * Joi validatie schema voor het updaten van een playlist (PUT)
 * @type {Joi.ObjectSchema}
 */
const playlistSchemaUpdate = Joi.object({
  id: Joi.number().integer().required(),
  naam: Joi.string().required(),
  beschrijving: Joi.string().required(),
  author: Joi.string().required(),
  visibility: Joi.string().valid('public', 'private').required(),
  spotify_url: Joi.string().allow('').optional()
});

/**
 * Leest alle playlists uit het JSON bestand
 * @async
 * @returns {Promise<Array>} Array van playlist objecten
 */
const readPlaylists = async () => {
  try {
    const data = await fs.readFile(playlistsFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

/**
 * Schrijft playlists array naar het JSON bestand
 * @async
 * @param {Array} playlists - Array van playlist objecten
 * @returns {Promise<void>}
 */
const writePlaylists = async (playlists) => {
  await fs.writeFile(playlistsFilePath, JSON.stringify(playlists, null, 2));
};

/**
 * Zoekt de index van een playlist in de array op basis van ID
 * @param {Array} playlists - Array van playlist objecten
 * @param {string|number} id - Playlist ID
 * @returns {number} Index van de playlist, of -1 als niet gevonden
 */
const findPlaylistIndex = (playlists, id) => {
  return playlists.findIndex(p => p.id === parseInt(id));
};

/**
 * Haalt alle playlists op met optionele sorting
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.sort] - Sorteerrichting ('asc' of 'desc')
 * @param {Object} res - Express response object
 * @returns {Object} JSON response met playlists array en count
 */
const getAllPlaylists = async (req, res) => {
  try {
    let playlists = await readPlaylists();
    
    const { sort } = req.query;
    if (sort === 'asc') {
      playlists.sort((a, b) => a.naam.localeCompare(b.naam));
    } else if (sort === 'desc') {
      playlists.sort((a, b) => b.naam.localeCompare(a.naam));
    }
    
    res.json({
      success: true,
      data: playlists,
      count: playlists.length
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error retrieving playlists'
    });
  }
};

/**
 * Haalt een specifieke playlist op via ID
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Playlist ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response met playlist data of leeg object bij 404
 */
const getPlaylistById = async (req, res) => {
  try {
    const playlists = await readPlaylists();
    const playlist = playlists.find(p => p.id === parseInt(req.params.id));
    
    if (!playlist) {
      return res.status(404).json({});
    }
    
    res.json({
      success: true,
      data: playlist
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error retrieving playlist'
    });
  }
};

/**
 * Maakt een nieuwe playlist aan met Joi validatie
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body met playlist data
 * @param {string} req.body.naam - Naam van de playlist
 * @param {string} req.body.beschrijving - Beschrijving van de playlist
 * @param {string} req.body.author - Auteur van de playlist
 * @param {string} req.body.visibility - Zichtbaarheid ('public' of 'private')
 * @param {string} [req.body.spotify_url] - Spotify URL (optioneel)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response met nieuwe playlist of error
 */
const createPlaylist = async (req, res) => {
  try {
    const { error } = playlistSchemaCreate.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }

    const playlists = await readPlaylists();
    const newId = playlists.length > 0 ? Math.max(...playlists.map(p => p.id)) + 1 : 1;
    
    const newPlaylist = {
      id: newId,
      naam: req.body.naam,
      beschrijving: req.body.beschrijving,
      author: req.body.author,
      visibility: req.body.visibility,
      spotify_url: req.body.spotify_url || ''
    };
    
    playlists.push(newPlaylist);
    await writePlaylists(playlists);
    
    res.status(201).json({
      success: true,
      data: newPlaylist
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error creating playlist'
    });
  }
};

/**
 * Update een volledige playlist met Joi validatie (id verplicht in body)
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Playlist ID
 * @param {Object} req.body - Request body met alle playlist velden
 * @param {number} req.body.id - Playlist ID (verplicht in body)
 * @param {string} req.body.naam - Naam van de playlist
 * @param {string} req.body.beschrijving - Beschrijving van de playlist
 * @param {string} req.body.author - Auteur van de playlist
 * @param {string} req.body.visibility - Zichtbaarheid ('public' of 'private')
 * @param {string} [req.body.spotify_url] - Spotify URL (optioneel)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response met geüpdatete playlist of error
 */
const updatePlaylist = async (req, res) => {
  try {
    const { error } = playlistSchemaUpdate.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }

    const playlists = await readPlaylists();
    const playlistIndex = findPlaylistIndex(playlists, req.params.id);
    
    if (playlistIndex === -1) {
      return res.status(404).json({});
    }
    
    const updatedPlaylist = {
      id: parseInt(req.params.id),
      naam: req.body.naam,
      beschrijving: req.body.beschrijving,
      author: req.body.author,
      visibility: req.body.visibility,
      spotify_url: req.body.spotify_url || ''
    };
    
    playlists[playlistIndex] = updatedPlaylist;
    await writePlaylists(playlists);
    
    res.json({
      success: true,
      data: updatedPlaylist
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error updating playlist'
    });
  }
};

/**
 * Update specifieke velden van een playlist (PATCH)
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Playlist ID
 * @param {Object} req.body - Request body met velden om te updaten
 * @param {string} [req.body.naam] - Naam van de playlist
 * @param {string} [req.body.beschrijving] - Beschrijving van de playlist
 * @param {string} [req.body.author] - Auteur van de playlist
 * @param {string} [req.body.visibility] - Zichtbaarheid ('public' of 'private')
 * @param {string} [req.body.spotify_url] - Spotify URL
 * @param {Object} res - Express response object
 * @returns {Object} JSON response met geüpdatete playlist of error
 */
const patchPlaylist = async (req, res) => {
  try {
    const playlists = await readPlaylists();
    const playlistIndex = findPlaylistIndex(playlists, req.params.id);
    
    if (playlistIndex === -1) {
      return res.status(404).json({});
    }
    
    const updatedPlaylist = { ...playlists[playlistIndex] };
    const { naam, beschrijving, author, visibility, spotify_url } = req.body;
    
    if (naam) updatedPlaylist.naam = naam;
    if (beschrijving) updatedPlaylist.beschrijving = beschrijving;
    if (author) updatedPlaylist.author = author;
    if (visibility) updatedPlaylist.visibility = visibility;
    if (spotify_url !== undefined) updatedPlaylist.spotify_url = spotify_url;
    
    playlists[playlistIndex] = updatedPlaylist;
    await writePlaylists(playlists);
    
    res.json({
      success: true,
      data: updatedPlaylist
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error updating playlist'
    });
  }
};

/**
 * Verwijdert een playlist uit de database
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Playlist ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response met verwijderde playlist of leeg object bij 404
 */
const deletePlaylist = async (req, res) => {
  try {
    const playlists = await readPlaylists();
    const playlistIndex = findPlaylistIndex(playlists, req.params.id);
    
    if (playlistIndex === -1) {
      return res.status(404).json({});
    }
    
    const deletedPlaylist = playlists[playlistIndex];
    playlists.splice(playlistIndex, 1);
    await writePlaylists(playlists);
    
    res.json({
      success: true,
      data: deletedPlaylist
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error deleting playlist'
    });
  }
};

module.exports = {
  getAllPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  patchPlaylist,
  deletePlaylist
};