import { runQdrant } from "./runner.js";
import { QdrantClient } from "@qdrant/js-client-rest"

export class QdrantExtended extends QdrantClient {
    constructor(opt) {

        if (opt === ":local:") {
            super({
                port: runQdrant()
            })
        }

        else super(opt);
    }
}