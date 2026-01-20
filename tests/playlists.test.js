/**
 * @fileoverview Tests voor Playlists API endpoints
 * @description Gebruikt Node.js ingebouwde test runner
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

const BASE_URL = 'http://localhost:3000/api/playlists';

describe('Playlists API', () => {

  describe('GET /api/playlists', () => {
    it('should return all playlists with success status', async () => {
      const response = await fetch(BASE_URL);
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(typeof data.count === 'number');
    });

    it('should sort playlists ascending when sort=asc', async () => {
      const response = await fetch(`${BASE_URL}?sort=asc`);
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      for (let i = 1; i < data.data.length; i++) {
        assert.ok(data.data[i - 1].naam.localeCompare(data.data[i].naam) <= 0);
      }
    });

    it('should sort playlists descending when sort=desc', async () => {
      const response = await fetch(`${BASE_URL}?sort=desc`);
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      for (let i = 1; i < data.data.length; i++) {
        assert.ok(data.data[i - 1].naam.localeCompare(data.data[i].naam) >= 0);
      }
    });
  });

  describe('GET /api/playlists/:id', () => {
    it('should return a playlist by id', async () => {
      const response = await fetch(`${BASE_URL}/1`);
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.id, 1);
    });

    it('should return 404 for non-existent playlist', async () => {
      const response = await fetch(`${BASE_URL}/99999`);
      const data = await response.json();

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(data, {});
    });
  });

  describe('POST /api/playlists', () => {
    it('should create a new playlist with valid data', async () => {
      const newPlaylist = {
        naam: 'Test Playlist',
        beschrijving: 'Test beschrijving',
        author: 'Test Author',
        visibility: 'public'
      };

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlaylist)
      });
      const data = await response.json();

      assert.strictEqual(response.status, 201);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.naam, 'Test Playlist');
      assert.ok(typeof data.data.id === 'number');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidPlaylist = {
        naam: 'Incomplete Playlist'
      };

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPlaylist)
      });
      const data = await response.json();

      assert.strictEqual(response.status, 400);
      assert.ok(data.error);
    });

    it('should return 400 for invalid visibility value', async () => {
      const invalidPlaylist = {
        naam: 'Test',
        beschrijving: 'Test',
        author: 'Test',
        visibility: 'invalid'
      };

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPlaylist)
      });
      const data = await response.json();

      assert.strictEqual(response.status, 400);
      assert.ok(data.error);
    });
  });

  describe('PUT /api/playlists/:id', () => {
    it('should update a playlist with valid data', async () => {
      const updatedPlaylist = {
        id: 1,
        naam: 'Updated Playlist',
        beschrijving: 'Updated beschrijving',
        author: 'Updated Author',
        visibility: 'private',
        spotify_url: ''
      };

      const response = await fetch(`${BASE_URL}/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlaylist)
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.naam, 'Updated Playlist');
    });

    it('should return 404 for non-existent playlist', async () => {
      const playlist = {
        id: 99999,
        naam: 'Test',
        beschrijving: 'Test',
        author: 'Test',
        visibility: 'public'
      };

      const response = await fetch(`${BASE_URL}/99999`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playlist)
      });
      const data = await response.json();

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(data, {});
    });

    it('should return 400 for missing id in body', async () => {
      const playlistWithoutId = {
        naam: 'Test',
        beschrijving: 'Test',
        author: 'Test',
        visibility: 'public'
      };

      const response = await fetch(`${BASE_URL}/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playlistWithoutId)
      });
      const data = await response.json();

      assert.strictEqual(response.status, 400);
      assert.ok(data.error);
    });
  });

  describe('PATCH /api/playlists/:id', () => {
    it('should partially update a playlist', async () => {
      const response = await fetch(`${BASE_URL}/1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam: 'Patched Playlist' })
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.naam, 'Patched Playlist');
    });

    it('should return 404 for non-existent playlist', async () => {
      const response = await fetch(`${BASE_URL}/99999`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam: 'Test' })
      });
      const data = await response.json();

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(data, {});
    });
  });

  describe('DELETE /api/playlists/:id', () => {
    it('should return 404 for non-existent playlist', async () => {
      const response = await fetch(`${BASE_URL}/99999`, {
        method: 'DELETE'
      });
      const data = await response.json();

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(data, {});
    });
  });

});

