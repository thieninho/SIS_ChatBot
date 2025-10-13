import { companyInfo } from "../promt_data/userpromt";
import systemPrompt from "../promt_data/systempromt";
import fs from "fs";
// Helper to update chat history
function updateHistory(setChatHistory, text, isError = false, isPending = false) {
    setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text: String(text), isError, isPending },
    ]);
}

// Helper to validate IP
function isValidIP(ip) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}

// Helper to validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function loadQAData() {
    const res = await fetch("/tempQA.json");
    return await res.json();
}

const qaData = await loadQAData();
console.log("Số lượng Q&A:", qaData.length);
console.log("Loaded QA data:", qaData);

function findRelevantContext(userPrompt, qaData, topK = 3) {
    const lowerPrompt = userPrompt.toLowerCase();

    const scored = qaData.map(item => {
        const q = item.question.toLowerCase();
        let score = 0;
        for (let word of lowerPrompt.split(" ")) {
        if (q.includes(word)) score++;
        }
        return { ...item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const topAnswers = scored
        .filter(item => item.score > 0)
        .slice(0, topK)
        .map(item => `Q: ${item.question}\nA: ${item.answer}`);

    return topAnswers.join("\n---\n");
    }


export async function generateBotResponse(history, setChatHistory) {
    /*
    try {
        const formattedHistory = [
            { role: "system", content: systemPrompt },
            ...history.map(({ role, text }) => ({
                role,
                content: String(text),
            })),
        ];

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini",
                messages: formattedHistory,
                temperature: 0.7,
                stream: false
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Something went wrong");

        const apiResponseText = data.choices[0].message.content.trim(); 
    */
            try {
            const userPrompt = history[history.length - 1]?.text || "";
            //const context = findRelevantContext(userPrompt);
            const context = findRelevantContext(userPrompt, qaData, 3);
            console.log("Found context:", context);
            const formattedHistory = [
                { role: "system", content: systemPrompt },
                ...history.map(({ role, text }) => ({
                    role,
                    content: String(text),
                })),
                { role: "user", content: companyInfo } // userPrompt needs to be defined or passed as an argument
            ];

            // Ghép conversation thành 1 prompt text
            const prompt = formattedHistory
                .map(m => `${m.role}: ${m.content}`)
                .join("\n");
            const finalPrompt = context
                ? `Context:\n${context}\n\n${prompt}`
                : prompt;
            const response = await fetch("http://localhost:11500/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "gpt-oss:20b-cloud",
                    messages: [
                        { role: "system", content: "You are a assistant." },
                        { role: "user", content: finalPrompt }
                    ],
                    stream: false
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Something went wrong");

            const apiResponseText = data.message?.content?.trim() || "⚠️ No response";

            console.log("Bot:", apiResponseText);
        //////////////////////////////////////////


        /////////////////////////////////////////
        // Device commands
        if (apiResponseText.startsWith("wink")) {
            const arg = apiResponseText.split(/\s+/)[1];
            if (!arg) return updateHistory(setChatHistory, "Please provide device serial or IP");
            updateHistory(setChatHistory, "Winking...", false, true);
            try {
                const reply = await companyInfo["wink"](arg);
                updateHistory(setChatHistory, reply);
            } catch (err) {
                updateHistory(setChatHistory, err, true);
            }
            return;
        }

        if (apiResponseText.startsWith("restart")) {
            const arg = apiResponseText.split(/\s+/)[1];
            if (!arg) return updateHistory(setChatHistory, "Please provide device serial or IP");
            updateHistory(setChatHistory, "Rebooting...", false, true);
            try {
                let lastMessage = null;
                for (let i = 0; i < 2; i++) {
                    await new Promise(res => setTimeout(res, 500));
                    const messages = await companyInfo["restart"](arg);
                    if (messages !== lastMessage) {
                        updateHistory(setChatHistory, messages);
                        lastMessage = messages;
                    }
                }
            } catch (err) {
                updateHistory(setChatHistory, err, true);
            }
            return;
        }

        if (apiResponseText.toLowerCase().startsWith("change ip")) {
            const parts = apiResponseText.split(/\s+/);
            let serial = null, oldIP, newIP;
            if (parts.length === 5) {
                serial = parts[2];
                oldIP = parts[3];
                newIP = parts[4];
            } else {
                oldIP = parts[2];
                newIP = parts[3];
            }
            if (!oldIP || !newIP) return updateHistory(setChatHistory, "⚠️ Please provide old and new IP addresses");
            updateHistory(setChatHistory, "Changing IP...", false, true);
            try {
                const reply = await companyInfo["change ip"](oldIP, newIP, serial);
                updateHistory(setChatHistory, reply);
            } catch (err) {
                updateHistory(setChatHistory, err, true);
            }
            return;
        }

        if (apiResponseText.startsWith("change config")) {
            const parts = apiResponseText.split(/\s+/);
            const ip = parts[2], configName = parts[3], value = parts[4], key = "symbology";
            if (!ip || !value) return updateHistory(setChatHistory, "⚠️ Please provide IP and config value");
            updateHistory(setChatHistory, "Changing config...", false, true);
            try {
                let lastMessage = null;
                for (let i = 0; i < 3; i++) {
                    await new Promise(res => setTimeout(res, 500));
                    const messages = await companyInfo["change config"](ip, configName, key, value);
                    if (messages !== lastMessage) {
                        updateHistory(setChatHistory, messages);
                        lastMessage = messages;
                    }
                }
            } catch (err) {
                updateHistory(setChatHistory, err, true);
            }
            return;
        }

        if (apiResponseText.toLowerCase().startsWith("open hmp")) {
            const parts = apiResponseText.split(" ");
            const ip = parts[2], port = parts[3] ? parseInt(parts[3]) : 1023;
            updateHistory(setChatHistory, "Opening HMP...", false, true);
            try {
                const reply = await companyInfo["open hmp"](ip, port);
                updateHistory(setChatHistory, reply);
            } catch (err) {
                updateHistory(setChatHistory, err, true);
            }
            return;
        }

        if (apiResponseText.toLowerCase().startsWith("close hmp")) {
            const parts = apiResponseText.split(" ");
            const ip = parts[2], port = parts[3] ? parseInt(parts[3]) : 1023;
            updateHistory(setChatHistory, "Closing HMP...", false, true);
            try {
                const reply = await companyInfo["close hmp"](ip, port);
                updateHistory(setChatHistory, reply);
            } catch (err) {
                updateHistory(setChatHistory, err, true);
            }
            return;
        }

        if (apiResponseText.toLowerCase().startsWith("xpress")) {
            const parts = apiResponseText.trim().split(/\s+/);
            const fn = `${parts[0].toUpperCase()} ${parts[1]}`;
            const ip = parts[2] || null;
            try {
                const reply = ip
                    ? await companyInfo["xpressFunctionDirectly"](fn, ip)
                    : await companyInfo["xpress"](fn);
                updateHistory(setChatHistory, reply);
            } catch (err) {
                updateHistory(setChatHistory, err, true);
            }
            return;
        }

        if (apiResponseText.toLowerCase().startsWith("open web monitor")) {
            const parts = apiResponseText.split(" ");
            const ip = parts[3] || parts[2];
            if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");
            updateHistory(setChatHistory, "Opening Web Monitor...", false, true);
            try {
                const reply = await companyInfo["open web monitor"](ip);
                updateHistory(setChatHistory, reply);
                if (reply && reply.startsWith("✅")) window.open(`http://${ip}`, "_blank");
            } catch (err) {
                updateHistory(setChatHistory, err, true);
            }
            return;
        }

        if (apiResponseText.toLowerCase().startsWith("list xpress")) {
            const ip = apiResponseText.split(" ")[2];
            if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");
            updateHistory(setChatHistory, "Opening List XPRESS...", false, true);
            try {
                const reply = await companyInfo["list xpress"](ip);
                if (reply.type === "success" && reply.results) {
                    let table = Object.entries(reply.results)
                        .map(([key, val]) => `• ${key} → ${val}`)
                        .join("\n");
                    updateHistory(setChatHistory, "XPRESS Functions:\n" + table);
                } else {
                    updateHistory(setChatHistory, reply.message || "❌ Failed to get XPRESS list");
                }
            } catch (err) {
                updateHistory(setChatHistory, err, true);
            }
            return;
        }

        if (apiResponseText.toLowerCase().startsWith("get statistics")) {
            const ip = apiResponseText.split(" ")[2];
            if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");
            updateHistory(setChatHistory, "Retrieving device statistics...", false, true);
            try {
                const reply = await companyInfo["get statistics"](ip);
                if (reply.type === "success" && reply.results) {
                    let table = Object.entries(reply.results)
                        .map(([key, val]) => `• ${key}: ${val}`)
                        .join("\n");
                    updateHistory(setChatHistory, "📊 Device Statistics:\n" + table);
                } else {
                    updateHistory(setChatHistory, reply.message || "❌ Failed to retrieve statistics.");
                }
            } catch (err) {
                updateHistory(setChatHistory, err, true);
            }
            return;
        }

        if (apiResponseText.toLowerCase().startsWith("send report")) {
            const parts = apiResponseText.split(" ");
            const ip = parts[2], email = parts[3];
            if (!isValidIP(ip)) return updateHistory(setChatHistory, "⚠️ Please provide a valid IP address");
            if (!isValidEmail(email)) return updateHistory(setChatHistory, "⚠️ Please provide a valid email address");
            updateHistory(setChatHistory, `Sending Statistics report to ${email}...`, false, true);
            try {
                const reply = await companyInfo["send report"](ip, email);
                updateHistory(setChatHistory, reply);
            } catch (err) {
                updateHistory(setChatHistory, err, true);
            }
            return;
        }

        // Company info and fallback
        if (companyInfo[apiResponseText]) {
            const value = companyInfo[apiResponseText];
            const reply = typeof value === "function" ? await value() : String(value);
            updateHistory(setChatHistory, reply);
        } else {
            // Fallback: show model response or supported features
            updateHistory(setChatHistory, apiResponseText);
        }
    } catch (error) {
        updateHistory(setChatHistory, error.message, true);
    }
}