# lanlan3292-terraria-player-map-renderer

使用 Node.js 从 Terraria 世界 tile 数据生成 `.map` 文件。无需安装第三方运行时依赖，要求 Node.js 18 或更高版本。

本库的地图格式编码和 palette option-count 数据参考 TEdit 的 [PlayerMapRenderer.cs](https://github.com/TEdit/Terraria-Map-Editor/blob/fd2c5bc5f9b24b90a3db22f24bce439b42fd769c/src/TEdit/Editor/Plugins/PlayerMapRenderer.cs)。上游项目使用 Microsoft Public License（MS-PL）；本分发附带 [LICENSE](LICENSE)。

## 安装

```sh
npm install github:lanlan3292/lanlan3292-terraria-player-map-renderer
```

## 使用

```js
const { buildMapAsync } = require('lanlan3292-terraria-player-map-renderer');

const outputFile = await buildMapAsync(world, './maps', {
  maxTileId: 753,
  maxWallId: 366,
});
console.log(`Wrote ${outputFile}`);
```

`outputPath` 必须是已存在的目录。`buildMapAsync` 根据 `WorldGenVersion` 使用 `WorldGUID` 或 `WorldId` 命名文件，写入完成后返回文件完整路径，并将 world 的 file revision 加一。

也可以使用同步内存 API：

```js
const { buildMapBuffer } = require('lanlan3292-terraria-player-map-renderer');
const mapBytes = buildMapBuffer(world);
```

它返回完整 `.map` 文件的 `Buffer`，并同样递增 world 的 file revision。

## World 数据

World 可使用 TEdit 的 PascalCase 属性，也可使用对应的 camelCase 属性。tile 数据可通过 `getTile(x, y)` 提供，或使用以 X 为外层索引的 `Tiles[x][y]` / `tiles[x][y]` 数组。每个 tile 使用以下字段：

- 世界：`Version`、`FileRevision`、`IsFavorite`、`Title`、`WorldId`、`WorldGUID`、`WorldGenVersion`、`TilesWide`、`TilesHigh`、`GroundLevel`
- tile：`IsActive`、`HasLiquid`、`LiquidType`、`Type`、`TileColor`、`Wall`、`WallColor`

生成 map 数据必需的世界字段是宽高及 tile 数据。其余字段缺省时会使用合理默认值。液体类型接受 Terraria 常用枚举数值 `0..3`（water、lava、honey、shimmer）或相应小写字符串。

`maxTileId` 和 `maxWallId` 是最大 ID（包含该 ID），默认值分别是 `753` 和 `366`。当前 palette 数据来自参考实现；超出其中定义范围的新 tile/wall ID 不会自动获得颜色选项，生成前请核对目标 Terraria 版本的 palette 与最大 ID。

## 示例

Node.js 文件示例会创建一个小型演示世界并写出 `.map` 文件：

```sh
node examples/node.js
```

启动本地浏览器演示：

```sh
npm run build:demo
npm run demo
```

然后打开 `http://127.0.0.1:4173`，选择 `.wld` 世界文件。解析器、压缩器和 map 编码器都已打包在静态 Worker 中；页面无需 Node 服务即可部署到 GitHub Pages，世界文件在浏览器本地处理，不会上传。更新浏览器解析代码或依赖后重新运行 `npm run build:demo`。解析依赖 `terraria-world-file`，基础支持范围为 Terraria 1.3.5.3 至 1.4.4.9；v323 及更新版本会跳过未知 header 尾字段，但 tile 区段仍严格校验，未来格式若修改 tile 编码则可能无法解析。

启用 GitHub Pages，将仓库根目录作为 Pages 发布源，然后访问 `/examples/` 下的 `index.html`。

页面代码见 [examples/index.html](examples/index.html)，浏览器 map 编码器见 [examples/map-from-parsed-world.mjs](examples/map-from-parsed-world.mjs)。

## API

### `buildMapAsync(world, outputPath, options?)`

将 `.map` 文件写入已有目录，返回 `Promise<string>`。

### `buildMapBuffer(world, options?)`

返回完整 `.map` 文件的 `Buffer`。

### `MapHelper.initialize(maxTileId?, maxWallId?)`

返回 tile/wall option counts 和 map lookup 数组，可用于检查 palette lookup。

### `options`

- `maxTileId`：最大 tile ID，默认 `753`。
- `maxWallId`：最大 wall ID，默认 `366`。

## 测试

```sh
npm test
```
