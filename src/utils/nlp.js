import * as use from '@tensorflow-models/universal-sentence-encoder';
import '@tensorflow/tfjs';

let qaData = [];
let model = null;

export async function loadQAData() {
    const res = await fetch("/questions_with_vectors.json");
    qaData = await res.json();
    console.log("No. Q&A:", qaData.length);
    return qaData;
}

export async function loadModel() {
    if (!model) {
        model = await use.load();
    }
    return model;
}

export async function embedPrompt(prompt) {
    if (!model) await loadModel();
    const embeddings = await model.embed([prompt]);
    return embeddings.arraySync()[0];
}
