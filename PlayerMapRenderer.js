'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { deflateRawSync } = require('node:zlib');

const RELOGIC_MAGIC = 27981915666277746n;
const FILE_TYPE_MAP = 1n;
const WORLD_GUID_VERSION = 777389080577n;

// Non-transparent map-color counts from the referenced TEdit palette.
const TILE_OPTION_RANGES =
  '0-3:1,4-5:2,6-14:1,15:2,16-18:1,19:2,20:1,21:5,22-25:1,26-27:2,28:9,29-30:1,31:2,32-79:1,80:4,81:1,82-84:7,85-88:1,89:3,90-104:1,105:3,106-126:1,128:1,129:2,130-132:1,133-134:2,136:1,137:3,138-148:1,149:3,150-159:1,160:9,161-164:1,165:4,166-177:1,178:7,179-183:1,184:11,185-187:12,188-209:1,211-226:1,227:12,228-239:1,240:5,241:1,242:2,243-418:1,419:3,420:6,421-422:1,423:7,424-427:1,429-439:1,440:7,441:5,442-452:1,453:3,454-456:1,457:5,458-460:1,461:4,462-466:1,467-468:12,469-486:1,487:2,488-492:1,493:6,494-503:1,505-517:1,518:3,519:6,520-528:1,529:5,530:4,531-540:1,542-547:1,548:2,549-559:1,560:3,561-571:1,572:6,573-590:1,591:9,592-596:1,597:11,598-626:1,627-628:9,629-646:1,647-650:12,651-652:1,653:9,654-691:1,692:9,693-694:4,695-696:2,697-704:1,705:4,706-752:1';
const WALL_OPTION_RANGES =
  '1-20:1,22-26:1,27:2,28-87:1,94-105:1,108-144:1,146-149:1,151:1,153-167:1,169-240:1,242-317:1,319-366:1';

function applyOptionRanges(target, ranges) {
  for (const entry of ranges.split(',')) {
    const [range, countText] = entry.split(':');
    const [startText, endText = startText] = range.split('-');
    const start = Number(startText);
    const end = Number(endText);
    const count = Number(countText);
    for (let id = start; id <= end && id < target.length; id++) {
      target[id] = count;
    }
  }
}

function createLookup(optionCounts, initialPosition) {
  const lookup = new Uint16Array(optionCounts.length);
  let position = initialPosition;
  for (let id = 0; id < optionCounts.length; id++) {
    if (optionCounts[id] > 0) {
      lookup[id] = position;
      position = (position + optionCounts[id]) & 0xffff;
    }
  }
  return { lookup, nextPosition: position };
}

class MapHelper {
  static initialize(maxTileId = 753, maxWallId = 366) {
    if (!Number.isInteger(maxTileId) || maxTileId < 0 || maxTileId > 32767) {
      throw new RangeError('maxTileId must be an integer from 0 to 32767.');
    }
    if (!Number.isInteger(maxWallId) || maxWallId < 0 || maxWallId > 32767) {
      throw new RangeError('maxWallId must be an integer from 0 to 32767.');
    }

    const tileOptionCounts = new Uint8Array(maxTileId + 1);
    const wallOptionCounts = new Uint8Array(maxWallId + 1);
    applyOptionRanges(tileOptionCounts, TILE_OPTION_RANGES);
    applyOptionRanges(wallOptionCounts, WALL_OPTION_RANGES);

    const tiles = createLookup(tileOptionCounts, 0);
    const walls = createLookup(wallOptionCounts, tiles.nextPosition);
    return {
      tileOptionCounts,
      wallOptionCounts,
      tileLookup: tiles.lookup,
      wallLookup: walls.lookup,
    };
  }
}

function getProperty(object, pascalName, camelName, fallback) {
  if (object[pascalName] !== undefined) return object[pascalName];
  if (object[camelName] !== undefined) return object[camelName];
  return fallback;
}

function getTile(world, x, y) {
  if (typeof world.getTile === 'function') return world.getTile(x, y);
  const tiles = world.Tiles ?? world.tiles;
  const tile = tiles?.[x]?.[y];
  if (!tile) throw new RangeError(`Missing tile data at (${x}, ${y}).`);
  return tile;
}

function writeDotNetString(chunks, value) {
  const data = Buffer.from(String(value), 'utf8');
  let length = data.length;
  while (length >= 0x80) {
    chunks.push(Buffer.from([(length & 0x7f) | 0x80]));
    length >>>= 7;
  }
  chunks.push(Buffer.from([length]), data);
}

function writeOptionCounts(chunks, counts) {
  let outputByte = 0;
  let bit = 0;
  for (const count of counts) {
    if (count !== 1) outputByte |= 1 << bit;
    bit++;
    if (bit === 8) {
      chunks.push(Buffer.from([outputByte]));
      outputByte = 0;
      bit = 0;
    }
  }
  if (bit !== 0) chunks.push(Buffer.from([outputByte]));
}

function writeCounts(chunks, counts) {
  const values = [];
  for (const count of counts) {
    if (count !== 1) values.push(count);
  }
  if (values.length > 0) chunks.push(Buffer.from(values));
}

function getLookupValue(lookup, id, label) {
  const value = lookup[id];
  if (value === undefined) throw new RangeError(`No ${label} map lookup for ID ${id}.`);
  return value;
}

function getLiquidLookup(tileLookup, liquidType) {
  const liquidIds = {
    0: 326,
    1: 327,
    2: 345,
    3: 447,
    water: 326,
    lava: 327,
    honey: 345,
    shimmer: 447,
  };
  const key = typeof liquidType === 'string' ? liquidType.toLowerCase() : liquidType;
  const tileId = liquidIds[key] ?? 326;
  return getLookupValue(tileLookup, tileId, 'tile');
}

function computeSnowiness(world, x, y, width, height) {
  const snowTiles = new Set([147, 161, 162, 163, 164, 200]);
  for (let scanX = x - 36; scanX <= x + 30; scanX += 10) {
    for (let scanY = y - 36; scanY <= y + 30; scanY += 10) {
      if (scanX < 0 || scanY < 0 || scanX >= width || scanY >= height) continue;
      const tile = getTile(world, scanX, scanY);
      if (getProperty(tile, 'IsActive', 'isActive', false) &&
          snowTiles.has(getProperty(tile, 'Type', 'type', 0))) {
        return 255;
      }
    }
  }
  return 0;
}

function writeMapData(world, mapHelper, width, height, groundLevel) {
  const output = [];
  let buffer = Buffer.allocUnsafe(16384);
  let offset = 0;

  const flush = () => {
    if (offset > 0) output.push(buffer.subarray(0, offset));
    buffer = Buffer.allocUnsafe(16384);
    offset = 0;
  };
  const writeByte = (value) => {
    if (offset === buffer.length) flush();
    buffer[offset++] = value & 0xff;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = getTile(world, x, y);
      const hasLiquid = getProperty(tile, 'HasLiquid', 'hasLiquid', false);
      const isActive = getProperty(tile, 'IsActive', 'isActive', false);
      const wall = getProperty(tile, 'Wall', 'wall', 0);
      let paintColor = 0;
      let tileData;
      let colorOffset = 1;
      let hasLight = true;

      if (hasLiquid) {
        tileData = getLiquidLookup(
          mapHelper.tileLookup,
          getProperty(tile, 'LiquidType', 'liquidType', 0),
        );
      } else if (isActive) {
        paintColor = getProperty(tile, 'TileColor', 'tileColor', 0);
        const tileType = getProperty(tile, 'Type', 'type', 0);
        tileData = getLookupValue(mapHelper.tileLookup, tileType, 'tile');
      } else if (wall > 0) {
        paintColor = getProperty(tile, 'WallColor', 'wallColor', 0);
        tileData = getLookupValue(mapHelper.wallLookup, wall, 'wall');
      } else {
        const underworldStart = height - 200;
        if (y < groundLevel || y >= underworldStart) {
          colorOffset = 6;
          hasLight = false;
          tileData = 0;
        } else {
          colorOffset = 7;
          tileData = computeSnowiness(world, x, y, width, height);
        }
      }

      const flagByte = paintColor > 0 ? (paintColor << 1) & 0xff : 0;
      let colorByte = (colorOffset << 1) | 32;
      if (flagByte !== 0) colorByte |= 1;
      if (tileData > 255) colorByte |= 16;
      writeByte(colorByte);
      if (flagByte !== 0) writeByte(flagByte);
      if (hasLight) {
        writeByte(tileData);
        if (tileData > 255) writeByte(tileData >> 8);
      }
      writeByte(255);
    }
  }

  if (offset > 0) output.push(buffer.subarray(0, offset));
  return Buffer.concat(output);
}

function buildMapBuffer(world, options = {}) {
  if (!world || typeof world !== 'object') throw new TypeError('world is required.');
  const width = getProperty(world, 'TilesWide', 'tilesWide');
  const height = getProperty(world, 'TilesHigh', 'tilesHigh');
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw new RangeError('World dimensions must be positive integers.');
  }

  const maxTileId = options.maxTileId ?? 753;
  const maxWallId = options.maxWallId ?? 366;
  const mapHelper = MapHelper.initialize(maxTileId, maxWallId);
  const metadata = [];
  const version = getProperty(world, 'Version', 'version', 0);
  const revision = (Number(getProperty(world, 'FileRevision', 'fileRevision', 0)) + 1) >>> 0;
  const favorite = getProperty(world, 'IsFavorite', 'isFavorite', false);
  const title = getProperty(world, 'Title', 'title', '');
  const worldId = getProperty(world, 'WorldId', 'worldId', 0);
  const groundLevel = getProperty(world, 'GroundLevel', 'groundLevel', 0);

  const versionBuffer = Buffer.allocUnsafe(4);
  versionBuffer.writeUInt32LE(Number(version) >>> 0);
  const typeBuffer = Buffer.allocUnsafe(8);
  typeBuffer.writeBigUInt64LE(RELOGIC_MAGIC | (FILE_TYPE_MAP << 56n));
  const revisionBuffer = Buffer.allocUnsafe(4);
  revisionBuffer.writeUInt32LE(revision);
  const favoriteBuffer = Buffer.allocUnsafe(8);
  favoriteBuffer.writeBigUInt64LE(favorite ? 1n : 0n);
  metadata.push(versionBuffer, typeBuffer, revisionBuffer, favoriteBuffer);
  writeDotNetString(metadata, title);

  const dimensions = Buffer.allocUnsafe(16);
  dimensions.writeInt32LE(Number(worldId), 0);
  dimensions.writeInt32LE(height, 4);
  dimensions.writeInt32LE(width, 8);
  dimensions.writeInt16LE(maxTileId + 1, 12);
  dimensions.writeInt16LE(maxWallId + 1, 14);
  metadata.push(dimensions, Buffer.from([4, 0, 0, 1, 0, 1, 0, 1]));

  writeOptionCounts(metadata, mapHelper.tileOptionCounts);
  writeOptionCounts(metadata, mapHelper.wallOptionCounts);
  writeCounts(metadata, mapHelper.tileOptionCounts);
  writeCounts(metadata, mapHelper.wallOptionCounts);

  const uncompressedMap = writeMapData(world, mapHelper, width, height, groundLevel);
  const compressedMap = deflateRawSync(uncompressedMap, { level: 6 });
  world.FileRevision !== undefined
    ? (world.FileRevision = revision)
    : (world.fileRevision = revision);
  return Buffer.concat([...metadata, compressedMap]);
}

async function buildMapAsync(world, outputPath, options = {}) {
  if (typeof outputPath !== 'string' || outputPath.length === 0) {
    throw new TypeError('outputPath must be a non-empty directory path.');
  }
  const directory = await fs.stat(outputPath);
  if (!directory.isDirectory()) throw new TypeError('outputPath must be a directory.');

  const worldGenVersion = BigInt(getProperty(world, 'WorldGenVersion', 'worldGenVersion', 0));
  const worldGuid = getProperty(world, 'WorldGUID', 'worldGuid', '');
  const worldId = getProperty(world, 'WorldId', 'worldId', 0);
  const fileName = worldGenVersion >= WORLD_GUID_VERSION
    ? `${worldGuid}.map`
    : `${worldId}.map`;
  const fullPath = path.join(outputPath, fileName);
  const data = buildMapBuffer(world, options);
  await fs.writeFile(fullPath, data);
  return fullPath;
}

module.exports = {
  MapHelper,
  buildMapAsync,
  buildMapBuffer,
};
