import { QdrantExtended } from "../index.js";

const qdrant = new QdrantExtended(":local:");

await qdrant.createCollection("testt", {
    vectors: {
        size: 768,
        distance: "Manhattan"
    }
});

console.log(await qdrant.getCollections());