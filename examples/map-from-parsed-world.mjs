const RELOGIC_MAGIC = 27981915666277746n;
const FILE_TYPE_MAP = 1n;
const WORLD_GUID_VERSION = 777389080577n;
const TILE_OPTION_RANGES = '0-3:1,4-5:2,6-14:1,15:2,16-18:1,19:2,20:1,21:5,22-25:1,26-27:2,28:9,29-30:1,31:2,32-79:1,80:4,81:1,82-84:7,85-88:1,89:3,90-104:1,105:3,106-126:1,128:1,129:2,130-132:1,133-134:2,136:1,137:3,138-148:1,149:3,150-159:1,160:9,161-164:1,165:4,166-177:1,178:7,179-183:1,184:11,185-187:12,188-209:1,211-226:1,227:12,228-239:1,240:5,241:1,242:2,243-418:1,419:3,420:6,421-422:1,423:7,424-427:1,429-439:1,440:7,441:5,442-452:1,453:3,454-456:1,457:5,458-460:1,461:4,462-466:1,467-468:12,469-486:1,487:2,488-492:1,493:6,494-503:1,505-517:1,518:3,519:6,520-528:1,529:5,530:4,531-540:1,542-547:1,548:2,549-559:1,560:3,561-571:1,572:6,573-590:1,591:9,592-596:1,597:11,598-626:1,627-628:9,629-646:1,647-650:12,651-652:1,653:9,654-691:1,692:9,693-694:4,695-696:2,697-704:1,705:4,706-752:1';
const WALL_OPTION_RANGES = '1-20:1,22-26:1,27:2,28-87:1,94-105:1,108-144:1,146-149:1,151:1,153-167:1,169-240:1,242-317:1,319-366:1';
const SNOW_TILE_IDS = new Set([147, 161, 162, 163, 164, 200]);
const PREVIEW_COLORS = new Map([
  [0, [151, 107, 75]], [1, [128, 128, 128]], [2, [28, 216, 94]],
  [3, [26, 196, 84]], [4, [253, 221, 3]], [5, [151, 107, 75]],
  [7, [150, 67, 22]], [8, [185, 164, 23]], [9, [185, 194, 195]],
  [22, [98, 95, 167]], [25, [109, 90, 128]], [41, [66, 84, 109]],
  [53, [186, 168, 84]], [60, [143, 215, 29]], [109, [78, 193, 227]],
  [147, [211, 236, 241]], [161, [144, 195, 232]], [162, [184, 219, 240]],
  [163, [174, 145, 214]], [164, [218, 182, 204]], [326, [9, 61, 191]],
  [327, [253, 32, 3]], [345, [255, 156, 12]], [447, [179, 132, 255]],
]);

function applyRanges(target, ranges) {
  for (const entry of ranges.split(',')) {
    const [range, countText] = entry.split(':');
    const [startText, endText = startText] = range.split('-');
    const count = Number(countText);
    for (let id = Number(startText), end = Number(endText); id <= end && id < target.length; id++) {
      target[id] = count;
    }
  }
}

function createLookup(counts, position) {
  const lookup = new Uint16Array(counts.length);
  for (let id = 0; id < counts.length; id++) {
    if (counts[id] > 0) {
      lookup[id] = position;
      position = (position + counts[id]) & 0xffff;
    }
  }
  return { lookup, nextPosition: position };
}

function createPalette(maxTileId, maxWallId) {
  const tileOptionCounts = new Uint8Array(maxTileId + 1);
  const wallOptionCounts = new Uint8Array(maxWallId + 1);
  applyRanges(tileOptionCounts, TILE_OPTION_RANGES);
  applyRanges(wallOptionCounts, WALL_OPTION_RANGES);
  const tiles = createLookup(tileOptionCounts, 0);
  const walls = createLookup(wallOptionCounts, tiles.nextPosition);
  return { tileOptionCounts, wallOptionCounts, tileLookup: tiles.lookup, wallLookup: walls.lookup };
}

class ByteWriter {
  constructor() {
    this.chunks = [];
    this.chunk = new Uint8Array(16384);
    this.offset = 0;
    this.length = 0;
  }

  writeByte(value) {
    if (this.offset === this.chunk.length) this.flush();
    this.chunk[this.offset++] = value & 0xff;
    this.length++;
  }

  writeInt16(value) {
    this.writeByte(value);
    this.writeByte(value >> 8);
  }

  writeInt32(value) {
    this.writeByte(value);
    this.writeByte(value >>> 8);
    this.writeByte(value >>> 16);
    this.writeByte(value >>> 24);
  }

  writeUInt64(value) {
    let remaining = BigInt.asUintN(64, BigInt(value));
    for (let index = 0; index < 8; index++) {
      this.writeByte(Number(remaining & 0xffn));
      remaining >>= 8n;
    }
  }

  writeString(value) {
    const bytes = new TextEncoder().encode(String(value));
    let length = bytes.length;
    while (length >= 0x80) {
      this.writeByte((length & 0x7f) | 0x80);
      length = Math.floor(length / 128);
    }
    this.writeByte(length);
    this.writeBytes(bytes);
  }

  writeBytes(bytes) {
    let start = 0;
    while (start < bytes.length) {
      if (this.offset === this.chunk.length) this.flush();
      const copied = Math.min(this.chunk.length - this.offset, bytes.length - start);
      this.chunk.set(bytes.subarray(start, start + copied), this.offset);
      this.offset += copied;
      this.length += copied;
      start += copied;
    }
  }

  flush() {
    if (this.offset > 0) this.chunks.push(this.chunk.subarray(0, this.offset));
    this.chunk = new Uint8Array(16384);
    this.offset = 0;
  }

  finish() {
    const result = new Uint8Array(this.length);
    let offset = 0;
    for (const chunk of this.chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    result.set(this.chunk.subarray(0, this.offset), offset);
    return result;
  }
}

function writeOptionCounts(writer, counts) {
  let byte = 0;
  let bit = 0;
  for (const count of counts) {
    if (count !== 1) byte |= 1 << bit;
    if (++bit === 8) {
      writer.writeByte(byte);
      byte = 0;
      bit = 0;
    }
  }
  if (bit !== 0) writer.writeByte(byte);
}

function writeCounts(writer, counts) {
  for (const count of counts) {
    if (count !== 1) writer.writeByte(count);
  }
}

function getGuid(header) {
  if (header.guidString) return header.guidString;
  const bytes = Array.from(header.guid ?? []);
  if (bytes.length !== 16) return '';
  const hex = (index) => bytes[index].toString(16).padStart(2, '0');
  return [
    [3, 2, 1, 0].map(hex).join(''),
    [5, 4].map(hex).join(''),
    [7, 6].map(hex).join(''),
    [8, 9].map(hex).join(''),
    [10, 11, 12, 13, 14, 15].map(hex).join(''),
  ].join('-');
}

function getWorldGeneratorVersion(header) {
  if (typeof header.worldGeneratorVersion === 'bigint') return header.worldGeneratorVersion;
  const bytes = header.worldGeneratorVersion;
  if (!bytes || bytes.length !== 8) return 0n;
  let result = 0n;
  for (let index = bytes.length - 1; index >= 0; index--) {
    result = (result << 8n) | BigInt(bytes[index]);
  }
  return result;
}

function getTile(worldTiles, x, y) {
  const tile = worldTiles.tiles?.[x]?.[y];
  if (!tile) throw new RangeError(`Missing parsed tile at (${x}, ${y}).`);
  return tile;
}

function mapTileData(tile, palette, worldTiles, x, y, width, height, groundLevel) {
  let paintColor = 0;
  let tileData;
  let colorOffset = 1;
  let hasLight = true;
  const liquidAmount = tile.liquidAmount ?? 0;

  if (liquidAmount > 0) {
    const liquidTileIds = [326, 327, 345, 447];
    const liquidIndex = (tile.liquidType ?? 1) - 1;
    const liquidTileId = liquidTileIds[liquidIndex] ?? 326;
    tileData = palette.tileLookup[liquidTileId];
  } else if (tile.blockId !== undefined && tile.blockId >= 0) {
    paintColor = tile.blockColor ?? 0;
    tileData = palette.tileLookup[tile.blockId];
  } else if ((tile.wallId ?? 0) > 0) {
    paintColor = tile.wallColor ?? 0;
    tileData = palette.wallLookup[tile.wallId];
  } else if (y < groundLevel || y >= height - 200) {
    colorOffset = 6;
    hasLight = false;
    tileData = 0;
  } else {
    colorOffset = 7;
    tileData = computeSnowiness(worldTiles, x, y, width, height);
  }

  if (tileData === undefined) {
    throw new RangeError(`No map lookup for tile ${tile.blockId ?? tile.wallId} at (${x}, ${y}).`);
  }
  return { paintColor, tileData, colorOffset, hasLight };
}

function computeSnowiness(worldTiles, x, y, width, height) {
  for (let scanX = x - 36; scanX <= x + 30; scanX += 10) {
    for (let scanY = y - 36; scanY <= y + 30; scanY += 10) {
      if (scanX < 0 || scanY < 0 || scanX >= width || scanY >= height) continue;
      const tile = getTile(worldTiles, scanX, scanY);
      if (tile.blockId !== undefined && SNOW_TILE_IDS.has(tile.blockId)) return 255;
    }
  }
  return 0;
}

async function writeMapData(worldTiles, palette, width, height, groundLevel, onProgress) {
  const writer = new ByteWriter();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { paintColor, tileData, colorOffset, hasLight } = mapTileData(
        getTile(worldTiles, x, y), palette, worldTiles, x, y, width, height, groundLevel,
      );
      const flagByte = paintColor > 0 ? (paintColor << 1) & 0xff : 0;
      let colorByte = (colorOffset << 1) | 32;
      if (flagByte !== 0) colorByte |= 1;
      if (tileData > 255) colorByte |= 16;
      writer.writeByte(colorByte);
      if (flagByte !== 0) writer.writeByte(flagByte);
      if (hasLight) {
        writer.writeByte(tileData);
        if (tileData > 255) writer.writeByte(tileData >> 8);
      }
      writer.writeByte(255);
    }
    if (y % 16 === 15 || y === height - 1) {
      onProgress(Math.round(((y + 1) / height) * 100));
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  return writer.finish();
}

export function createMapPreview(parsedWorld, maxWidth = 900, maxHeight = 560) {
  const header = parsedWorld.header;
  const worldTiles = parsedWorld.worldTiles;
  const width = header.maxTilesX;
  const height = header.maxTilesY;
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  const previewWidth = Math.max(1, Math.floor(width * scale));
  const previewHeight = Math.max(1, Math.floor(height * scale));
  const pixels = new Uint8ClampedArray(previewWidth * previewHeight * 4);
  const groundLevel = header.worldSurface ?? 0;

  for (let previewY = 0; previewY < previewHeight; previewY++) {
    const y = Math.min(height - 1, Math.floor(previewY * height / previewHeight));
    for (let previewX = 0; previewX < previewWidth; previewX++) {
      const x = Math.min(width - 1, Math.floor(previewX * width / previewWidth));
      const tile = getTile(worldTiles, x, y);
      let color;
      if ((tile.liquidAmount ?? 0) > 0) {
        color = tile.liquidType === 2 ? [244, 76, 46] : tile.liquidType === 3 ? [246, 174, 41] : [75, 174, 208];
      } else if (tile.blockId !== undefined) {
        color = PREVIEW_COLORS.get(tile.blockId) ?? [147, 150, 137];
      } else if ((tile.wallId ?? 0) > 0) {
        color = [98, 91, 83];
      } else if (y < groundLevel || y >= height - 200) {
        color = [145, 205, 211];
      } else {
        color = [119, 91, 68];
      }
      const offset = (previewY * previewWidth + previewX) * 4;
      pixels[offset] = color[0];
      pixels[offset + 1] = color[1];
      pixels[offset + 2] = color[2];
      pixels[offset + 3] = 255;
    }
  }
  return { width: previewWidth, height: previewHeight, pixels };
}

export async function buildMapFromParsedWorld(parsedWorld, { compress, onProgress = () => {}, maxTileId = 753, maxWallId = 366 } = {}) {
  if (typeof compress !== 'function') throw new TypeError('A raw DEFLATE compressor is required.');
  const fileHeader = parsedWorld?.fileFormatHeader;
  const header = parsedWorld?.header;
  const worldTiles = parsedWorld?.worldTiles;
  if (!fileHeader || !header || !worldTiles?.tiles) {
    throw new TypeError('Parsed world must contain fileFormatHeader, header, and worldTiles.');
  }

  const width = header.maxTilesX;
  const height = header.maxTilesY;
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw new RangeError('Parsed world dimensions are invalid.');
  }
  const palette = createPalette(maxTileId, maxWallId);
  const metadata = new ByteWriter();
  const revision = ((fileHeader.revision ?? 0) + 1) >>> 0;
  const title = header.mapName ?? '';
  const worldId = header.worldId ?? 0;
  const groundLevel = header.worldSurface ?? 0;

  metadata.writeInt32(fileHeader.version);
  metadata.writeUInt64(RELOGIC_MAGIC | (FILE_TYPE_MAP << 56n));
  metadata.writeInt32(revision);
  metadata.writeUInt64(fileHeader.favorite ? 1n : 0n);
  metadata.writeString(title);
  metadata.writeInt32(worldId);
  metadata.writeInt32(height);
  metadata.writeInt32(width);
  metadata.writeInt16(maxTileId + 1);
  metadata.writeInt16(maxWallId + 1);
  metadata.writeBytes(new Uint8Array([4, 0, 0, 1, 0, 1, 0, 1]));
  writeOptionCounts(metadata, palette.tileOptionCounts);
  writeOptionCounts(metadata, palette.wallOptionCounts);
  writeCounts(metadata, palette.tileOptionCounts);
  writeCounts(metadata, palette.wallOptionCounts);

  const metadataBytes = metadata.finish();
  const rawMap = await writeMapData(worldTiles, palette, width, height, groundLevel, onProgress);
  const compressedMap = compress(rawMap, { level: 6 });
  const bytes = new Uint8Array(metadataBytes.length + compressedMap.length);
  bytes.set(metadataBytes);
  bytes.set(compressedMap, metadataBytes.length);
  fileHeader.revision = revision;

  const worldGeneratorVersion = getWorldGeneratorVersion(header);
  const fileName = worldGeneratorVersion >= WORLD_GUID_VERSION
    ? `${getGuid(header)}.map`
    : `${worldId}.map`;
  return { bytes, fileName, metadataBytes: metadataBytes.length, width, height, title, revision };
}
