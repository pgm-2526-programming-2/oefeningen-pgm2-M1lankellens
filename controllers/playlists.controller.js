const fs = require('fs').promises;
const path = require('path');
const Joi = require('joi');

const playlistsFilePath = path.join(__dirname, '../models/playlists.json');

// Joi schema voor POST 
const playlistSchemaCreate = Joi.object({
  naam: Joi.string().required(),
  beschrijving: Joi.string().required(),
  author: Joi.string().required(),
  visibility: Joi.string().valid('public', 'private').required(),
  spotify_url: Joi.string().allow('').optional()
});

// Joi schema voor PUT 
const playlistSchemaUpdate = Joi.object({
  id: Joi.number().integer().required(),
  naam: Joi.string().required(),
  beschrijving: Joi.string().required(),
  author: Joi.string().required(),
  visibility: Joi.string().valid('public', 'private').required(),
  spotify_url: Joi.string().allow('').optional()
});

// Lees alle playlists uit JSON
const readPlaylists = async () => {
  try {
    const data = await fs.readFile(playlistsFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Schrijf playlists array naar JSON
const writePlaylists = async (playlists) => {
  await fs.writeFile(playlistsFilePath, JSON.stringify(playlists, null, 2));
};

// Zoekt array index van een playlist op basis van ID
const findPlaylistIndex = (playlists, id) => {
  return playlists.findIndex(p => p.id === parseInt(id));
};

// Haal alle playlists op 
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

// Haal specifieke playlist op via ID
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

// Maak een nieuwe playlist
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

// Update volledige playlist
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

// Update velden van playlist
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

// Verwijder playlist
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
