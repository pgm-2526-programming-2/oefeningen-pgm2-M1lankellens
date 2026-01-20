const express = require('express');
const tracksRouter = require('./routes/tracks.routes');
const playlistsRouter = require('./routes/playlists.routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/tracks', tracksRouter);
app.use('/api/playlists', playlistsRouter);

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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((error, req, res, next) => {
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});

module.exports = app;
