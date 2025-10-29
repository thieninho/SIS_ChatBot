import { companyInfo } from "../promt_data/userpromt";
import systemPrompt from "../promt_data/systempromt";
import { loadUseModel } from "./useModel";
let deviceMap = {};


function formatDevice(ip) {
    if (deviceMap[ip]) {
        const { model } = deviceMap[ip];
        console.log("Formatting device:", model, ip);
        return `${model} @ ${ip}`;
    }
    return ip;
}

function updateHistory(setChatHistory, text, isError = false, isPending = false) {
    setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text: String(text), isError, isPending },
    ]);
}

// ==== Helper validate ====
function isValidIP(ip) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function formatTimestamp() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

// ==== Load QA ====
async function loadQAData() {
    const res = await fetch("/questions_with_vectors.json");
    return await res.json();
}
const qaData = await loadQAData();
console.log("No. Q&A:", qaData.length);

// ==== Cosine similarity ====
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return magB === 0 ? 0 : dotProduct / (magA * magB);
}

function findRelevantContext(promptVector, qaData, topK = 50, threshold = 0.5, minResults = 10) {
    const scored = qaData.map(item => ({
        ...item,
        similarity: cosineSimilarity(promptVector, item.vector)
    }));
    scored.sort((a, b) => b.similarity - a.similarity);
    let selected = scored.filter(item => item.similarity >= threshold);
    if (selected.length < minResults) {
        const extraNeeded = minResults - selected.length;
        const extraItems = scored.slice(selected.length, selected.length + extraNeeded);
        selected = [...selected, ...extraItems];
    }
    selected = selected.slice(0, topK);
    return selected.map(item =>
        `Data: ${item.data}\n(similarity: ${item.similarity.toFixed(3)})`
    ).join("\n---\n");
}

const model = await loadUseModel();

// ==== Generate Bot Response ====
export async function generateBotResponse(history, setChatHistory) {
    try {
        let userPrompt = history[history.length - 1]?.text || "";
        userPrompt = userPrompt.replace("Using the details provided above, please address this query:", "").trim();

        const embeddings = await model.embed([userPrompt]);
        const userVector = embeddings.arraySync()[0];
        const context = await findRelevantContext(userVector, qaData, 50, 0.4, 10);
        const formattedHistory = [
            { role: "system", content: systemPrompt },
            ...history.map(({ role, text }) => ({ role, content: String(text) })),
            { role: "user", content: companyInfo }
        ];
        const prompt = formattedHistory.map(m => `${m.role}: ${m.content}`).join("\n");
        const finalPrompt = context ? `Context:\n${context}\n\n${prompt}` : prompt;

        //const response = await fetch("http://10.84.30.107:11500/api/chat", {
        const response = await fetch("http://localhost:11500/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gpt-oss:20b-cloud",
                messages: [
                    { role: "system", content: "You are an assistant. Answer only if sure." },
                    { role: "user", content: finalPrompt }
                ],
                stream: false,
                options: { temperature: 0 }
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Something went wrong");

        const apiResponseText = data.message?.content?.trim() || "I don’t have information about your request.";
        console.log("Bot:", apiResponseText);

        // === Discover ===
if (apiResponseText.toLowerCase().startsWith("all devices")) {
    try {
        updateHistory(setChatHistory, `Discovering...`, false, true);
        const devices = await companyInfo["all devices"](); 
        // devices là array [{ ip, model }]
        
        deviceMap = { 
            ...deviceMap, 
            ...Object.fromEntries(devices.map(d => [d.ip, { model: d.model, serial: d.serial }])) 
        };

        const formattedList = devices
            .map(d => `- ${d.model}; IP: ${d.ip}; Serial: ${d.serial}`)
            .join("\n");

        console.log("Discovered devices:", formattedList);
        updateHistory(setChatHistory, "Discovered devices:\n" + formattedList);
    } catch (err) {
        updateHistory(setChatHistory, err, true);
    }
    return;
}

// wink
if (apiResponseText.startsWith("wink")) {
    const arg = apiResponseText.split(/\s+/)[1];
    if (!arg) return updateHistory(setChatHistory, "⚠️ Please provide device IP");

    const device = deviceMap[arg];
    const deviceText = device?.model ? `${device.model} | IP: ${arg}` : `IP: ${arg}`;

    updateHistory(setChatHistory, `Winking... ${deviceText}`, false, true);
    try {
        const reply = await companyInfo["wink"](arg);
        updateHistory(setChatHistory, reply);
    } catch (err) {
        updateHistory(setChatHistory, err, true);
    }
    return;
}

// restart
if (apiResponseText.startsWith("restart")) {
    const arg = apiResponseText.split(/\s+/)[1];
    if (!arg) return updateHistory(setChatHistory, "⚠️ Please provide device IP");

    const device = deviceMap[arg];
    const deviceText = device?.model ? `${device.model} | IP: ${arg}` : `IP: ${arg}`;

    updateHistory(setChatHistory, `Rebooting... ${deviceText}`, false, true);
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

// change ip
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

    const device = deviceMap[oldIP];
    const deviceText = device?.model ? `${device.model} | Old IP: ${oldIP} → New IP: ${newIP}` : `Old IP: ${oldIP} → New IP: ${newIP}`;

    updateHistory(setChatHistory, `Changing IP... ${deviceText}`, false, true);
    try {
        const reply = await companyInfo["change ip"](oldIP, newIP, serial);
        updateHistory(setChatHistory, reply);
    } catch (err) {
        updateHistory(setChatHistory, err, true);
    }
    return;
}

// change config
if (apiResponseText.startsWith("change config")) {
    const parts = apiResponseText.split(/\s+/);
    const ip = parts[2], configName = parts[3], value = parts[4], key = "symbology";
    if (!ip || !value) return updateHistory(setChatHistory, "⚠️ Please provide IP and config value");

    const device = deviceMap[ip];
    const deviceText = device?.model ? `${device.model} | IP: ${ip}` : `IP: ${ip}`;

    updateHistory(setChatHistory, `Changing config... ${deviceText}`, false, true);
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

// open hmp
if (apiResponseText.toLowerCase().startsWith("open hmp")) {
    const parts = apiResponseText.split(" ");
    const ip = parts[2], port = parts[3] ? parseInt(parts[3]) : 1023;
    if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");

    const device = deviceMap[ip];
    const deviceText = device?.model ? `${device.model} | IP: ${ip}:${port}` : `IP: ${ip}:${port}`;

    updateHistory(setChatHistory, `Opening HMP... ${deviceText}`, false, true);
    try {
        const reply = await companyInfo["open hmp"](ip, port);
        updateHistory(setChatHistory, reply);
    } catch (err) {
        updateHistory(setChatHistory, err, true);
    }
    return;
}

// close hmp
if (apiResponseText.toLowerCase().startsWith("close hmp")) {
    const parts = apiResponseText.split(" ");
    const ip = parts[2], port = parts[3] ? parseInt(parts[3]) : 1023;
    if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");

    const device = deviceMap[ip];
    const deviceText = device?.model ? `${device.model} | IP: ${ip}:${port}` : `IP: ${ip}:${port}`;

    updateHistory(setChatHistory, `Closing HMP... ${deviceText}`, false, true);
    try {
        const reply = await companyInfo["close hmp"](ip, port);
        updateHistory(setChatHistory, reply);
    } catch (err) {
        updateHistory(setChatHistory, err, true);
    }
    return;
}

// xpress function
if (apiResponseText.toLowerCase().startsWith("xpressfunction")) {
    const parts = apiResponseText.trim().split(/\s+/);
    const fn = `${parts[0].toUpperCase()} ${parts[1]}`;
    const ip = parts[2] || null;

    const device = ip ? deviceMap[ip] : null;
    const deviceText = device?.model ? `${device.model} | IP: ${ip}` : (ip ? `IP: ${ip}` : "");

    updateHistory(setChatHistory, `Running XPRESS Function ${fn} ${deviceText}`, false, true);
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

// open web page
if (apiResponseText.toLowerCase().startsWith("open web page")) {
    const parts = apiResponseText.split(" ");
    const ip = parts[3] || parts[2];
    if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");

    const device = deviceMap[ip];
    const deviceText = device?.model ? `${device.model} | IP: ${ip}` : `IP: ${ip}`;

    updateHistory(setChatHistory, `Opening web page... ${deviceText}`, false, true);
    try {
        const reply = await companyInfo["open web page"](ip);
        updateHistory(setChatHistory, reply);
    } catch (err) {
        updateHistory(setChatHistory, err, true);
    }
    return;
}

// open web monitor
if (apiResponseText.toLowerCase().startsWith("open web monitor")) {
    const parts = apiResponseText.split(" ");
    const ip = parts[3] || parts[2];
    if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");

    const device = deviceMap[ip];
    const deviceText = device?.model ? `${device.model} | IP: ${ip}` : `IP: ${ip}`;

    updateHistory(setChatHistory, `Opening web monitor... ${deviceText}`, false, true);
    try {
        const reply = await companyInfo["open web monitor"](ip);
        updateHistory(setChatHistory, reply);
    } catch (err) {
        updateHistory(setChatHistory, err, true);
    }
    return;
}

// open web statistics
if (apiResponseText.toLowerCase().startsWith("open web statistics")) {
    const parts = apiResponseText.split(" ");
    const ip = parts[3] || parts[2];
    if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");

    const device = deviceMap[ip];
    const deviceText = device?.model ? `${device.model} | IP: ${ip}` : `IP: ${ip}`;

    updateHistory(setChatHistory, `Opening web statistics... ${deviceText}`, false, true);
    try {
        const reply = await companyInfo["open web statistics"](ip);
        updateHistory(setChatHistory, reply);
    } catch (err) {
        updateHistory(setChatHistory, err, true);
    }
    return;
}

// list xpress
if (apiResponseText.toLowerCase().startsWith("list xpress")) {
    const ip = apiResponseText.split(" ")[2];
    if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");

    const device = deviceMap[ip];
    const deviceText = device?.model ? `${device.model} | IP: ${ip}` : `IP: ${ip}`;

    updateHistory(setChatHistory, `Opening List XPRESS... ${deviceText}`, false, true);
    try {
        const reply = await companyInfo["list xpress"](ip);
        if (reply.type === "success" && reply.results) {
            let table = Object.entries(reply.results)
                .map(([key, val]) => `• ${key} → ${val}`)
                .join("\n");
            updateHistory(setChatHistory, "XPRESS Functions:\n" + table);
        } else {
            updateHistory(setChatHistory, reply.message || "Failed to get XPRESS list");
        }
    } catch (err) {
        updateHistory(setChatHistory, err, true);
    }
    return;
}

// get statistics
if (apiResponseText.toLowerCase().startsWith("get statistics")) {
    const ip = apiResponseText.split(" ")[2];
    if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");

    const device = deviceMap[ip];
    const deviceText = device?.model ? `${device.model} | IP: ${ip}` : `IP: ${ip}`;

    updateHistory(setChatHistory, `Retrieving device statistics... ${deviceText}`, false, true);

    try {
        const reply = await companyInfo["get statistics"](ip);
        if (reply.type === "success" && reply.results) {
            const allowedFields = [
                "Elapsed Time (sec)", "Valid Code Count", "Reading Phase Count", "Number of Decoded Codes",
                "Good Read Count", "Partial Read Count", "No Read Count", "No Code Count", "Multiple Read Count",
                "Successful Collection Count", "Failed Collection Count", "Match Code Count", "No Match Code Count",
                "Average Barcode X Pixel Position On Image", "Average Barcode Y Pixel Position On Image",
                "Frame Rate (fps)", "Conveyor Speed (mm/sec)", "Encoder Frequency",
                "Average Codes or Labels Found", "Average Decoding Time (ms)",
                "Image Acquisition Counter", "Average Image Aquisition Time (ms)", "Average Image Processing Time (ms)"
            ];
            let table = Object.entries(reply.results)
                .filter(([key]) => allowedFields.includes(key))
                .map(([key, val]) => `• ${key}: ${val}`)
                .join("\n");
            updateHistory(setChatHistory, "📊 Device Statistics:\n" + table);
        } else {
            updateHistory(setChatHistory, reply || "Failed to get device statistics");
        }
    } catch (err) {
        updateHistory(setChatHistory, err, true);
    }
    return;
}

// send report
if (apiResponseText.toLowerCase().startsWith("send report")) {
    const parts = apiResponseText.split(" ");
    const ip = parts[2], email = parts[3];
    if (!isValidIP(ip)) return updateHistory(setChatHistory, "⚠️ Please provide a valid IP address");
    if (!isValidEmail(email)) return updateHistory(setChatHistory, "⚠️ Please provide a valid email address");

    const device = deviceMap[ip];
    const deviceText = device?.model ? `${device.model} | IP: ${ip}` : `IP: ${ip}`;

    updateHistory(setChatHistory, `Sending Statistics report to ${email}... ${deviceText}`, false, true);
    try {
        const reply = await companyInfo["send report"](ip, email);
        updateHistory(setChatHistory, reply);
    } catch (err) {
        updateHistory(setChatHistory, err, true);
    }
    return;
}

// decode
if (apiResponseText.toLowerCase().startsWith("decode")) {
    const parts = apiResponseText.split(/\s+/);
    const ip = parts[1];
    if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");
    const device = deviceMap[ip];
    const deviceText = device?.model ? `${device.model} | IP: ${ip}` : `IP: ${ip}`;
    updateHistory(setChatHistory, `Decoding... ${deviceText}`, false, true);
    updateHistory(setChatHistory, ` When the decoding process is finished, I will send a notification message.`, false, true);
    try {
        const reply = await companyInfo["decode"](ip);
        if (reply?.message) updateHistory(setChatHistory, reply.message);
        if (reply?.toolFound) {
            const cleanedTool = reply.toolFound.replace(/\s*[12]D decoder tool.*/i, "").trim();
            updateHistory(setChatHistory, "Code found: " + cleanedTool);
        }
    } catch (err) {
        updateHistory(setChatHistory, "Error occurred while decoding", true);
    }
    return;
}

// get data
if (apiResponseText.toLowerCase().startsWith("get data")) {
    const parts = apiResponseText.split(/\s+/);
    const ip = parts[2];
    const port = parts[3] || 51236;
    const time = parts[4] || 5000;
    if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");

    const device = deviceMap[ip];
    const deviceText = device?.model ? `${device.model} | IP: ${ip}:${port}` : `IP: ${ip}:${port}`;

    updateHistory(setChatHistory, `Retrieving data... ${deviceText}`, false, true);
    try {
        const reply = await companyInfo["get data"](ip, port, time);
        if (reply?.data && Array.isArray(reply.data)) {
            reply.data.forEach((item) => {
                const ts = formatTimestamp();
                updateHistory(setChatHistory, `${ts} - Code content: ${item}`);
            });
        } else {
            updateHistory(setChatHistory, reply.message || "⚠️ No data received");
        }
    } catch (err) {
        updateHistory(setChatHistory, String(err), true);
    }
    return;
}
        // === Fallback ===
        if (companyInfo[apiResponseText]) {
            const value = companyInfo[apiResponseText];
            const reply = typeof value === "function" ? await value() : String(value);
            updateHistory(setChatHistory, reply);
        } else {
            updateHistory(setChatHistory, apiResponseText);
        }

    } catch (error) {
        updateHistory(setChatHistory, error.message, true);
    }
}
