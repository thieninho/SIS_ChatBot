import { companyInfo } from "../promt_data/userpromt";
import systemPrompt from "../promt_data/systempromt"



export async function generateBotResponse(history, setChatHistory) {
    const updateHistory = (text, isError = false) => {
        setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text: String(text), isError },
        ]);
    };

    const formattedHistory = [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...history.map(({ role, text }) => ({
        role,
        parts: [{ text: String(text) }],
        })),
    ];

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedHistory }),
    };

    try {
        const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok)
        throw new Error(data.error?.message || "Something went wrong");
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        //      WINK    //
        if (apiResponseText.startsWith("wink")) {
            const parts = apiResponseText.trim().split(/\s+/);
            const arg = parts[1] || null;

            if (!arg) {
                updateHistory("Please provide device serial or IP");
                return;
            }

            setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Thinking..."),
                { role: "model", text: "Winking...", isPending: true }
            ]);

            try {
                const reply = await companyInfo["wink"](arg);
                setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Winking..."),
                { role: "model", text: reply }
                ]);
            } catch (err) {
                setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Winking..."),
                { role: "model", text: String(err), isError: true }
                ]);
            }
            return;
        }
        //      Restart    //
        if (apiResponseText.startsWith("restart")) {
            const parts = apiResponseText.trim().split(/\s+/);
            const arg = parts[1] || null;

            if (!arg) {
                updateHistory("Please provide device serial or IP");
                return;
            }

            setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Thinking..."),
                { role: "model", text: "Rebooting...", isPending: true }
            ]);

            try {
                const reply = await companyInfo["restart"](arg);
                setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Rebooting..."),
                { role: "model", text: reply }
                ]);
            } catch (err) {
                setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Rebooting..."),
                { role: "model", text: String(err), isError: true }
                ]);
            }
            return;
        }
        //      CHANGE IP    //
        if (apiResponseText.toLowerCase().startsWith("change ip")) {
            const parts = apiResponseText.split(/\s+/);
            let serial = null;
            let oldIP, newIP;
            if (parts.length === 5) {
                serial = parts[2];
                oldIP = parts[3];
                newIP = parts[4];
            } else {
                oldIP = parts[2];
                newIP = parts[3];
            }

            if (!oldIP || !newIP) {
                updateHistory("⚠️ Please provide old and new IP addresses");
                return;
            }

            setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Thinking..."),
                { role: "model", text: "Changing IP..." ,isPending: true },
            ]);
            try {
                const reply = await companyInfo["change ip"](oldIP, newIP, serial);
                setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Changing IP..."),
                { role: "model", text: reply }
                ]);
            } catch (err) {
                setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Changing IP..."),
                { role: "model", text: String(err), isError: true }
                ]);
            }
            return;
        }
        //      CHANGE CONFIG     //
        if (apiResponseText.startsWith("change config")) {
            const parts = apiResponseText.split(/\s+/);
            const ip = parts[2] || null;         // lấy IP sau "change config"
            const configName = parts[3] || null;       // lấy name sau "IP"
            const value = parts[4] || null;      // QR
            const key = "symbology";             // ở đây fix key = symbology, có thể mở rộng sau

            if (!ip || !value) {
                updateHistory("⚠️ Please provide IP and config value");
                return;
            }

            setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Thinking..."),
                { role: "model", text: "Changing config...", isPending: true },
            ]);

            // try {
            //     const reply = await companyInfo["change config"](ip, configName, key, value);
            //     setChatHistory((prev) => [
            //     ...prev.filter((msg) => msg.text !== "Changing config..."),
            //     { role: "model", text: reply },
            //     ]);
            // }
            try {
            let lastMessage = null;

            for (let i = 0; i < 3; i++) {
                await new Promise(res => setTimeout(res, 500));
                const messages = await companyInfo["change config"](ip, configName, key, value);
                    if (messages !== lastMessage) {
                        setChatHistory((prev) => [
                        ...prev.filter((msg) => msg.text !== "Changing config..."),
                        { role: "model", text: messages },
                        ]);
                        lastMessage = messages;
                    }
                }
            }
            catch (err) {
                setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Changing config..."),
                { role: "model", text: String(err), isError: true },
                ]);
            }
            return;
            }
        // --- xử lý open hmp ---
        if (apiResponseText.toLowerCase().startsWith("open hmp")) {
            const parts = apiResponseText.split(" ");
            const ip = parts[2];
            const port = parts[3] ? parseInt(parts[3]) : 1023;

            setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Thinking..."),
                { role: "model", text: "Opening HMP...", isPending: true },
            ]);

            try {
                const reply = await companyInfo["open hmp"](ip, port);
                setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Opening HMP..."),
                { role: "model", text: reply },
                ]);
            } catch (err) {
                setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Opening HMP..."),
                { role: "model", text: String(err), isError: true },
                ]);
            }
            return;
            }

            // --- xử lý close hmp ---
            if (apiResponseText.toLowerCase().startsWith("close hmp")) {
            const parts = apiResponseText.split(" ");
            const ip = parts[2];
            const port = parts[3] ? parseInt(parts[3]) : 1023;

            setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Thinking..."),
                { role: "model", text: "Closing HMP...", isPending: true },
            ]);

            try {
                const reply = await companyInfo["close hmp"](ip, port);
                setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Closing HMP..."),
                { role: "model", text: reply },
                ]);
            } catch (err) {
                setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Closing HMP..."),
                { role: "model", text: String(err), isError: true },
                ]);
            }
            return;
        }

        // --- xử lý xpress function ---
        if (apiResponseText.toLowerCase().startsWith("xpress")) {
            const fn = apiResponseText.toUpperCase();
            updateHistory("Running " + fn + "...");
            try {
                const reply = await companyInfo["xpress"](fn);
                setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Running " + fn + "..."),
                { role: "model", text: reply },
                ]);
                //updateHistory(reply);
            } catch (err) {
                updateHistory(err, true);
            }
            return;
        }
        // --- xử lý open web monitor ---
    if (apiResponseText.toLowerCase().startsWith("open web monitor")) {
        const parts = apiResponseText.split(" ");
        const ip = parts[3] || parts[2];  // ví dụ: "open web monitor 192.168.1.10"

        if (!ip) {
            setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Thinking..."),
                { role: "model", text: "⚠️ Please provide device IP" }
            ]);
            return;
        }

        setChatHistory((prev) => [
            ...prev.filter((msg) => msg.text !== "Thinking..."),
            { role: "model", text: "Opening Web Monitor...", isPending: true },
        ]);

        try {
            const reply = await companyInfo["open web monitor"](ip);

            setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Opening Web Monitor..."),
                { role: "model", text: reply },
            ]);
            // nếu cần mở tab mới
            if (reply && reply.startsWith("✅")) {
                window.open(`http://${ip}`, "_blank");
            }
        } catch (err) {
            setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Opening Web Monitor..."),
                { role: "model", text: String(err), isError: true },
            ]);
        }
        return;
    }

    // --- xử lý open list function ---
if (apiResponseText.toLowerCase().startsWith("list xpress")) {
    const parts = apiResponseText.split(" ");
    const ip = parts[2]; 
    if (!ip) {
        setChatHistory((prev) => [
            ...prev.filter((msg) => msg.text !== "Thinking..."),
            { role: "model", text: "⚠️ Please provide device IP" }
        ]);
        return;
    }

    setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text: "Opening List XPRESS...", isPending: true },
    ]);

    try {
        const reply = await companyInfo["list xpress"](ip);

        if (reply.type === "success" && reply.results) {
            let table = Object.entries(reply.results)
            .map(([key, val]) => `• ${key} → ${val}`)
            .join("\n");
            setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Opening List XPRESS..."),
                { role: "model", text: "XPRESS Functions:\n" + table },
            ]);
            //await sendReportEmail(reply.results, ip, "target@example.com");
        } else {
            setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Opening List XPRESS..."),
                { role: "model", text: reply.message || "❌ Failed to get XPRESS list" },
            ]);
        }

    } catch (err) {
        setChatHistory((prev) => [
            ...prev.filter((msg) => msg.text !== "Opening Web Monitor..."),
            { role: "model", text: String(err), isError: true },
        ]);
    }
    return;
}


// --- xử lý send report ---
if (apiResponseText.toLowerCase().startsWith("send report")) {
    const parts = apiResponseText.split(" ");
    const ip = parts[2];
    const email = parts[3];

    // validate IP
    if (!ip || !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
        setChatHistory((prev) => [
            ...prev.filter((msg) => msg.text !== "Thinking..."),
            { role: "model", text: "⚠️ Please provide a valid IP address" },
        ]);
        return;
    }
    // validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setChatHistory((prev) => [
            ...prev.filter((msg) => msg.text !== "Thinking..."),
            { role: "model", text: "⚠️ Please provide a valid email address" },
        ]);
        return;
    }
    if (!ip) {
            setChatHistory((prev) => [
                ...prev.filter((msg) => msg.text !== "Thinking..."),
                { role: "model", text: "⚠️ Please provide device IP" }
            ]);
            return;
        }
    setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text: `Sending XPRESS report to ${email}...`, isPending: true },
    ]);

    try {
        const reply = await companyInfo["send report"](ip, email);
        setChatHistory((prev) => [
            ...prev.filter((msg) => msg.text !== `Sending XPRESS report to ${email}...`),
            { role: "model", text: reply },
        ]);
    } catch (err) {
        setChatHistory((prev) => [
            ...prev.filter((msg) => msg.text !== `Sending XPRESS report to ${email}...`),
            { role: "model", text: String(err), isError: true },
        ]);
    }
    return;
}
    //-----------------------------------------------------------//
        if (companyInfo[apiResponseText]) {
            const value = companyInfo[apiResponseText];
            const reply =typeof value === "function" ? await value() : String(value);
            updateHistory(reply);
        }
        else {
        updateHistory(apiResponseText);
        }
    } catch (error) {
        updateHistory(error.message, true);
    }
}
