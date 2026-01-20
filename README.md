# Mockify API 🎶

## Introduction

Mockify is een REST API die lijkt op delen van de Spotify API. De API biedt CRUD functionaliteit voor twee resources: **tracks** (nummers) en **playlists** (afspeellijsten). Gebouwd met Node.js en Express, met Joi validatie en data opslag in JSON bestanden.

## Installation

```bash
# Clone repository
git clone https://github.com/pgm-2526-programming-2/oefeningen-pgm2-M1lankellens.git

# Installeer dependencies
npm install

# Start de server
npm start

npm run dev
```

De API draait op `http://localhost:3000`

## Feature Overview

### Endpoints

#### Tracks `/api/tracks`

| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/tracks` | Alle tracks ophalen |
| GET | `/api/tracks?sort=asc` | Tracks gesorteerd (asc/desc) |
| GET | `/api/tracks?naam=...` | Filter op naam |
| GET | `/api/tracks?artiest=...` | Filter op artiest |
| GET | `/api/tracks?genre=...` | Filter op genre |
| GET | `/api/tracks?jaar=...` | Filter op jaar |
| GET | `/api/tracks/:id` | Track op ID |
| POST | `/api/tracks` | Nieuwe track aanmaken |
| PUT | `/api/tracks/:id` | Track volledig updaten |
| PATCH | `/api/tracks/:id` | Track gedeeltelijk updaten |
| DELETE | `/api/tracks/:id` | Track verwijderen |

#### Playlists `/api/playlists`

| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/playlists` | Alle playlists ophalen |
| GET | `/api/playlists?sort=asc` | Playlists gesorteerd (asc/desc) |
| GET | `/api/playlists?naam=...` | Filter op naam |
| GET | `/api/playlists?author=...` | Filter op author |
| GET | `/api/playlists?visibility=public` | Filter op visibility |
| GET | `/api/playlists/:id` | Playlist op ID |
| POST | `/api/playlists` | Nieuwe playlist aanmaken |
| PUT | `/api/playlists/:id` | Playlist volledig updaten |
| PATCH | `/api/playlists/:id` | Playlist gedeeltelijk updaten |
| DELETE | `/api/playlists/:id` | Playlist verwijderen |

### Data Structuur

**Track:**
```json
{
  "id": 1,
  "naam": "Bohemian Rhapsody",
  "bpm": 72,
  "duur": 355,
  "jaar": 1975,
  "artiesten": ["Queen"],
  "genres": ["Rock"],
  "spotify_url": "https://open.spotify.com/track/..."
}
```

**Playlist:**
```json
{
  "id": 1,
  "naam": "Chill Vibes",
  "beschrijving": "Relaxing music",
  "author": "Milan Kellens",
  "visibility": "public",
  "spotify_url": "https://open.spotify.com/playlist/..."
}
```

### Validatie

- POST/PUT requests worden gevalideerd met Joi
- 400 status bij ongeldige input
- 404 status bij niet gevonden resource
- 500 status bij server errors

### Scripts

```bash
npm start      # Start server
npm run dev    # Start met nodemon
npm run lint   # ESLint check
npm run test   # Node tests uitvoeren
```

## Author

**Milan Kellens**  
Arteveldehogeschool - PGM 2
