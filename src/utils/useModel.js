import '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

let model;
export async function loadUseModel() {
    if (!model) {
        model = await use.load({ modelUrl: "/models/use/model.json" });
    }
    return model;
    }
