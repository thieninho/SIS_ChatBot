import { updateHistory } from "../utils/history.js";
import { findRelevantContext } from "../utils/similarity.js";
import { embedPrompt, loadQAData } from "../utils/nlp.js";
import { handleCompanyCommand } from "../utils/commands.js";
import systemPrompt from "../promt_data/systempromt.js";
import { companyInfo } from "../promt_data/userpromt.js";

const qaData = await loadQAData();

export async function generateBotResponse(history, setChatHistory) {
    try {
        let userPrompt = history.at(-1)?.text || "";
        userPrompt = userPrompt.replace("Using the details provided above, please address this query:", "").trim();

        const userVector = await embedPrompt(userPrompt);
        const context = findRelevantContext(userVector, qaData, 5);

        const formattedHistory = [
            { role: "system", content: systemPrompt },
            ...history.map(({ role, text }) => ({ role, content: String(text) })),
            { role: "user", content: companyInfo }
        ];

        const prompt = formattedHistory.map(m => `${m.role}: ${m.content}`).join("\n");
        const finalPrompt = context ? `Context:\n${context}\n\n${prompt}` : prompt;

        const response = await fetch("http://10.84.30.78:11500/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gpt-oss:20b-cloud",
                messages: [
                    { role: "system", content: "You are an assistant. Answer only if sure." },
                    { role: "user", content: finalPrompt }
                ],
                stream: false,
                options: { temperature: 0, top_k: 1, num_predict: 256, seed: 1234 }
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Something went wrong");

        const apiResponseText = data.message?.content?.trim() || "⚠️ No response";

        const handled = await handleCompanyCommand(apiResponseText, setChatHistory);
        if (!handled) updateHistory(setChatHistory, apiResponseText);

    } catch (err) {
        updateHistory(setChatHistory, err.message, true);
    }
}
