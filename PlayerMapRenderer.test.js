'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { inflateRawSync } = require('node:zlib');
const { MapHelper, buildMapBuffer } = require('./PlayerMapRenderer');

test('buildMapBuffer writes map metadata and compressed tile bytes', () => {
  const world = {
    Version: 279,
    FileRevision: 4,
    IsFavorite: false,
    Title: 'Test',
    WorldId: 42,
    TilesWide: 1,
    TilesHigh: 1,
    GroundLevel: 1,
    Tiles: [[{ IsActive: false, HasLiquid: false, Wall: 0 }]],
  };
  const maxTileId = 753;
  const maxWallId = 366;
  const buffer = buildMapBuffer(world, { maxTileId, maxWallId });
  const helper = MapHelper.initialize(maxTileId, maxWallId);
  const optionBytes = Math.ceil(helper.tileOptionCounts.length / 8) +
    Math.ceil(helper.wallOptionCounts.length / 8);
  const countBytes = [...helper.tileOptionCounts, ...helper.wallOptionCounts]
    .filter((count) => count !== 1).length;
  const compressedOffset = 24 + 5 + 16 + 8 + optionBytes + countBytes;

  assert.equal(buffer.readUInt32LE(0), 279);
  assert.equal(buffer.readBigUInt64LE(4), 27981915666277746n | (1n << 56n));
  assert.equal(buffer.readUInt32LE(12), 5);
  assert.equal(world.FileRevision, 5);
  assert.deepEqual(inflateRawSync(buffer.subarray(compressedOffset)), Buffer.from([44, 255]));
});

test('MapHelper preserves palette option counts and offsets', () => {
  const helper = MapHelper.initialize();

  assert.equal(helper.tileOptionCounts[185], 12);
  assert.equal(helper.tileOptionCounts[428], 0);
  assert.equal(helper.wallOptionCounts[27], 2);
  assert.equal(helper.tileLookup[185], helper.tileLookup[184] + 11);
});
