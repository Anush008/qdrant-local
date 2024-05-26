<div align="center">
  <a href="https://www.npmjs.com/package/qdrant-local"><img src="https://avatars.githubusercontent.com/u/73504361?s=100"><h1> Qdrant-LocalJS </h1></a>
  <h4>Extension of the Qdrant JS SDK with local support.</h4>
</div>
<p align="center">
  <img src="https://img.shields.io/github/languages/code-size/Anush008/qdrant-local" alt="GitHub code size in bytes">
  <img src="https://img.shields.io/github/commit-activity/w/Anush008/qdrant-local" alt="GitHub commit activity">
  <a href="https://github.com/anush008/qdrant-local/issues">
    <img src="https://img.shields.io/github/issues/Anush008/qdrant-local" alt="GitHub issues">
  </a>
</p>

## Installation

```bash
npm i qdrant-local
```

The above step also downloads a Qdrant binary specific to your platform.

## Usage

This library exports a `QdrantExtended` class that subclasses the [Qdrant client library](https://www.npmjs.com/package/@qdrant/js-client-rest). Essentially everything except `new QdrantExtended(":local:")` is the same as the original.

```javascript
import { QdrantExtended } from "qdrant-local";


const qdrant = new QdrantExtended(":local:");
// const qdrant = new QdrantExtended({host: '127.0.0.1', port: 6333}); // Still supported

await qdrant.createCollection("test", {
    vectors: {
        size: 768,
        distance: "Manhattan"
    }
});

console.log(await qdrant.getCollections())
```

The binary downloader/runner is based on <https://github.com/Anush008/qdrant-npm>.
