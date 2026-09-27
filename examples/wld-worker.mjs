import { deflateSync } from '../node_modules/fflate/esm/browser.js';
import { FileReader } from '../node_modules/terraria-world-file/dist/index.mjs';
import { fileLoader } from '../node_modules/terraria-world-file/dist/platform/browser.mjs';
import { buildMapFromParsedWorld, createMapPreview } from './map-from-parsed-world.mjs';

self.onmessage = async (event) => {
  const { file } = event.data;
  try {
    self.postMessage({ type: 'status', message: 'Reading world file…' });
    const parser = await new FileReader().loadFile(fileLoader, file);
    self.postMessage({ type: 'status', message: 'Parsing world tiles…' });
    const parsedWorld = parser.parse({
      sections: ['fileFormatHeader', 'header', 'worldTiles'],
    });
    const preview = createMapPreview(parsedWorld);
    const worldInfo = {
      title: parsedWorld.header.mapName,
      width: parsedWorld.header.maxTilesX,
      height: parsedWorld.header.maxTilesY,
      version: parsedWorld.fileFormatHeader.version,
    };
    self.postMessage({ type: 'preview', preview, worldInfo }, [preview.pixels.buffer]);
    self.postMessage({ type: 'status', message: 'Encoding map data…' });
    const result = await buildMapFromParsedWorld(parsedWorld, {
      compress: deflateSync,
      onProgress: (percent) => self.postMessage({ type: 'progress', percent }),
    });
    self.postMessage({
      type: 'complete',
      fileName: result.fileName,
      width: result.width,
      height: result.height,
      bytes: result.bytes.buffer,
    }, [result.bytes.buffer]);
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
};
