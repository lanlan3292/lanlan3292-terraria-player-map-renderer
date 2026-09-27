'use strict';

const http = require('node:http');
const { buildMapBuffer } = require('lanlan3292-terraria-player-map-renderer');

async function main() {
  const width = 32;
  const height = 20;
  const tiles = Array.from({ length: width }, (_, x) =>
    Array.from({ length: height }, (_, y) => {
      const groundHeight = 8 + Math.floor(Math.sin(x / 4) * 2);
      if (y < groundHeight) {
        return { IsActive: false, HasLiquid: false, Wall: 0 };
      }
      if (y === groundHeight) {
        return { IsActive: true, Type: 2, TileColor: 0, HasLiquid: false, Wall: 0 };
      }
      return { IsActive: true, Type: 0, TileColor: 0, HasLiquid: false, Wall: 0 };
    }),
  );

  for (let x = 21; x < 28; x++) {
    for (let y = 7; y < 11; y++) {
      tiles[x][y] = {
        IsActive: false,
        HasLiquid: true,
        LiquidType: 0,
        Wall: 0,
      };
    }
  }

  const world = {
    Version: 279,
    FileRevision: 0,
    IsFavorite: false,
    Title: 'JavaScript map demo',
    WorldId: 12345,
    WorldGUID: 'demo-world-guid',
    WorldGenVersion: 777389080577n,
    TilesWide: width,
    TilesHigh: height,
    GroundLevel: 8,
    Tiles: tiles,
  };

  const mapBuffer = buildMapBuffer(world);
  const fileName = `${world.WorldGUID}.map`;
  const server = http.createServer((request, response) => {
    if (request.method !== 'GET' || request.url !== '/map') {
      response.writeHead(404).end();
      return;
    }

    response.writeHead(200, {
      'content-type': 'application/octet-stream',
      'content-length': mapBuffer.length,
      'x-map-file-name': fileName,
    });
    response.end(mapBuffer);
  });

  server.listen(4180, '127.0.0.1', () => {
    console.log(`Serving ${mapBuffer.length} binary bytes at http://127.0.0.1:4180/map`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
