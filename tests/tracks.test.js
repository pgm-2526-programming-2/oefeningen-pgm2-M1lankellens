/**
 * @fileoverview Tests voor Tracks API endpoints
 * @description Gebruikt Node.js ingebouwde test runner
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

const BASE_URL = 'http://localhost:3000/api/tracks';

describe('Tracks API', () => {

  describe('GET /api/tracks', () => {
    it('should return all tracks with success status', async () => {
      const response = await fetch(BASE_URL);
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(typeof data.count === 'number');
    });

    it('should sort tracks ascending when sort=asc', async () => {
      const response = await fetch(`${BASE_URL}?sort=asc`);
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      for (let i = 1; i < data.data.length; i++) {
        assert.ok(data.data[i - 1].naam.localeCompare(data.data[i].naam) <= 0);
      }
    });

    it('should sort tracks descending when sort=desc', async () => {
      const response = await fetch(`${BASE_URL}?sort=desc`);
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      for (let i = 1; i < data.data.length; i++) {
        assert.ok(data.data[i - 1].naam.localeCompare(data.data[i].naam) >= 0);
      }
    });
  });

  describe('GET /api/tracks/:id', () => {
    it('should return a track by id', async () => {
      const response = await fetch(`${BASE_URL}/1`);
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.id, 1);
    });

    it('should return 404 for non-existent track', async () => {
      const response = await fetch(`${BASE_URL}/99999`);
      const data = await response.json();

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(data, {});
    });
  });

  describe('POST /api/tracks', () => {
    it('should create a new track with valid data', async () => {
      const newTrack = {
        naam: 'Test Track',
        bpm: 120,
        duur: 180,
        jaar: 2024,
        artiesten: ['Test Artist'],
        genres: ['Test Genre']
      };

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrack)
      });
      const data = await response.json();

      assert.strictEqual(response.status, 201);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.naam, 'Test Track');
      assert.ok(typeof data.data.id === 'number');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidTrack = {
        naam: 'Incomplete Track'
      };

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTrack)
      });
      const data = await response.json();

      assert.strictEqual(response.status, 400);
      assert.ok(data.error);
    });
  });

  describe('PUT /api/tracks/:id', () => {
    it('should update a track with valid data', async () => {
      const updatedTrack = {
        id: 1,
        naam: 'Updated Track',
        bpm: 100,
        duur: 200,
        jaar: 2023,
        artiesten: ['Updated Artist'],
        genres: ['Updated Genre'],
        spotify_url: ''
      };

      const response = await fetch(`${BASE_URL}/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTrack)
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.naam, 'Updated Track');
    });

    it('should return 404 for non-existent track', async () => {
      const track = {
        id: 99999,
        naam: 'Test',
        bpm: 100,
        duur: 200,
        jaar: 2023,
        artiesten: ['Artist'],
        genres: ['Genre']
      };

      const response = await fetch(`${BASE_URL}/99999`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(track)
      });
      const data = await response.json();

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(data, {});
    });

    it('should return 400 for missing id in body', async () => {
      const trackWithoutId = {
        naam: 'Test',
        bpm: 100,
        duur: 200,
        jaar: 2023,
        artiesten: ['Artist'],
        genres: ['Genre']
      };

      const response = await fetch(`${BASE_URL}/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackWithoutId)
      });
      const data = await response.json();

      assert.strictEqual(response.status, 400);
      assert.ok(data.error);
    });
  });

  describe('PATCH /api/tracks/:id', () => {
    it('should partially update a track', async () => {
      const response = await fetch(`${BASE_URL}/1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam: 'Patched Track' })
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.naam, 'Patched Track');
    });

    it('should return 404 for non-existent track', async () => {
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

  describe('DELETE /api/tracks/:id', () => {
    it('should return 404 for non-existent track', async () => {
      const response = await fetch(`${BASE_URL}/99999`, {
        method: 'DELETE'
      });
      const data = await response.json();

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(data, {});
    });
  });

});

