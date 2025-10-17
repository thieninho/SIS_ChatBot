import { updateHistory, formatTimestamp } from "./history.js";
import { isValidIP, isValidEmail } from "./validators.js";
import { companyInfo } from "../promt_data/userpromt.js";

export async function handleCompanyCommand(apiResponseText, setChatHistory) {
    const lower = apiResponseText.toLowerCase();

    if (lower.startsWith("wink")) {
        const arg = apiResponseText.split(/\s+/)[1];
        if (!arg) return updateHistory(setChatHistory, "⚠️ Please provide device serial or IP");
        updateHistory(setChatHistory, "Winking...", false, true);
        const reply = await companyInfo["wink"](arg);
        return updateHistory(setChatHistory, reply);
    }

    if (lower.startsWith("restart")) {
        const arg = apiResponseText.split(/\s+/)[1];
        if (!arg) return updateHistory(setChatHistory, "⚠️ Please provide device serial or IP");
        updateHistory(setChatHistory, "Rebooting...", false, true);
        let lastMessage = null;
        for (let i = 0; i < 2; i++) {
            await new Promise(res => setTimeout(res, 500));
            const messages = await companyInfo["restart"](arg);
            if (messages !== lastMessage) {
                updateHistory(setChatHistory, messages);
                lastMessage = messages;
            }
        }
        return;
    }

    if (lower.startsWith("decode")) {
        const ip = apiResponseText.split(/\s+/)[1];
        if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");
        updateHistory(setChatHistory, `Decoding on ${ip}...`, false, true);
        const reply = await companyInfo["decode"](ip);
        updateHistory(setChatHistory, reply.message);
        return updateHistory(setChatHistory, "Decode completed.");
    }

    if (lower.startsWith("get data")) {
        const parts = apiResponseText.split(/\s+/);
        const ip = parts[2];
        const port = parts[3] || 51236;
        const time = parts[4] || 5000;
        if (!ip) return updateHistory(setChatHistory, "⚠️ Please provide device IP");
        updateHistory(setChatHistory, `Retrieving data from ${ip}:${port}...`, false, true);
        const reply = await companyInfo["get data"](ip, port, time);
        if (reply?.data && Array.isArray(reply.data)) {
            reply.data.forEach(item => {
                updateHistory(setChatHistory, `📌 ${formatTimestamp()}: ${item}`);
            });
        } else {
            updateHistory(setChatHistory, reply.message || "⚠️ No data received");
        }
        return;
    }

    if (lower.startsWith("send report")) {
        const [ , , ip, email ] = apiResponseText.split(/\s+/);
        if (!isValidIP(ip)) return updateHistory(setChatHistory, "⚠️ Please provide a valid IP address");
        if (!isValidEmail(email)) return updateHistory(setChatHistory, "⚠️ Please provide a valid email address");
        updateHistory(setChatHistory, `Sending Statistics report to ${email}...`, false, true);
        const reply = await companyInfo["send report"](ip, email);
        return updateHistory(setChatHistory, reply);
    }

    if (companyInfo[apiResponseText]) {
        const value = companyInfo[apiResponseText];
        const reply = typeof value === "function" ? await value() : String(value);
        return updateHistory(setChatHistory, reply);
    }

    return false;
}
