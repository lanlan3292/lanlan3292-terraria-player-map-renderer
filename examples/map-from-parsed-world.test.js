'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { inflateRawSync } = require('node:zlib');
const { deflateSync } = require('fflate');
const { MapHelper } = require('../PlayerMapRenderer');

test('browser encoder maps parsed Terraria tiles to a compressed .map payload', async () => {
  const { buildMapFromParsedWorld: buildMap, createMapPreview: createPreview } = await import('./map-from-parsed-world.mjs');
  const parsedWorld = {
    fileFormatHeader: { version: 279, revision: 8, favorite: false },
    header: {
      mapName: 'Browser test',
      worldId: 42,
      maxTilesX: 1,
      maxTilesY: 1,
      worldSurface: 1,
      worldGeneratorVersion: new Uint8Array(8),
      guid: new Uint8Array(16),
    },
    worldTiles: { tiles: [[{}]] },
  };

  const result = await buildMap(parsedWorld, { compress: deflateSync });
  const helper = MapHelper.initialize();
  const optionBytes = Math.ceil(helper.tileOptionCounts.length / 8) +
    Math.ceil(helper.wallOptionCounts.length / 8);
  const countBytes = [...helper.tileOptionCounts, ...helper.wallOptionCounts]
    .filter((count) => count !== 1).length;

  assert.equal(result.fileName, '42.map');
  assert.equal(result.revision, 9);
  assert.equal(new DataView(result.bytes.buffer).getUint32(0, true), 279);
  assert.deepEqual(
    inflateRawSync(result.bytes.subarray(result.metadataBytes)),
    Buffer.from([44, 255]),
  );
  assert.equal(result.metadataBytes, 24 + 13 + 16 + 8 + optionBytes + countBytes);
  assert.equal(parsedWorld.fileFormatHeader.revision, 9);

  const preview = createPreview(parsedWorld);
  assert.deepEqual([preview.width, preview.height, preview.pixels.length], [1, 1, 4]);
});

test('browser encoder uses the parsed GUID for modern map filenames', async () => {
  const { buildMapFromParsedWorld: buildMap } = await import('./map-from-parsed-world.mjs');
  const parsedWorld = {
    fileFormatHeader: { version: 315, revision: 0 },
    header: {
      mapName: 'Modern', worldId: 7, maxTilesX: 1, maxTilesY: 1, worldSurface: 1,
      worldGeneratorVersion: 777389080577n,
      guid: new Uint8Array([0x33, 0x22, 0x11, 0x00, 0x55, 0x44, 0x77, 0x66, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]),
    },
    worldTiles: { tiles: [[{}]] },
  };

  const result = await buildMap(parsedWorld, { compress: deflateSync });
  assert.equal(result.fileName, '00112233-4455-6677-8899-aabbccddeeff.map');
});

test('browser encoder writes underground background tiles', async () => {
  const { buildMapFromParsedWorld: buildMap } = await import('./map-from-parsed-world.mjs');
  const parsedWorld = {
    fileFormatHeader: { version: 279, revision: 0 },
    header: {
      mapName: 'Underground',
      worldId: 8,
      maxTilesX: 1,
      maxTilesY: 202,
      worldSurface: 1,
      worldGeneratorVersion: new Uint8Array(8),
      guid: new Uint8Array(16),
    },
    worldTiles: { tiles: [Array.from({ length: 202 }, () => ({}))] },
  };

  const result = await buildMap(parsedWorld, { compress: deflateSync });
  assert.deepEqual(
    inflateRawSync(result.bytes.subarray(result.metadataBytes)).subarray(0, 7),
    Buffer.from([44, 255, 46, 0, 255, 44, 255]),
  );
});
