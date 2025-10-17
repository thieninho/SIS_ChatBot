function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((s, a) => s + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((s, b) => s + b * b, 0));
    return magB === 0 ? 0 : dot / (magA * magB);
}

export function findRelevantContext(promptVector, qaData, topK = 5) {
    const scored = qaData.map(item => ({
        ...item,
        similarity: cosineSimilarity(promptVector, item.vector)
    }));
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, topK)
        .map(item => `Data: ${item.data}\n(similarity: ${item.similarity.toFixed(3)})`)
        .join("\n---\n");
}
