import { sendMessage, addMessageListener } from "./socketClient";

export async function decodeFunction(ip, useStandard = "false") {
    return new Promise((resolve, reject) => {
        let ackReceived = false;
        const cleanup = () => removeListener();
        const removeListener = addMessageListener((msg) => {
            if (msg === "ACK") {
                ackReceived = true;
                console.log("✅ ACK received, waiting for JSON...");
                return;
            }
            try {
                const data = JSON.parse(msg);
                console.log("Received data:", data);
                if (!ackReceived) {
                    cleanup();
                    reject("❌ No ACK before response");
                    return;
                }
                if (data.type === "success" && data.message === "Decode function executed successfully.") {
                    cleanup();
                    resolve(data);
                }
            } catch (e) {
                cleanup();
                reject("❌ Error parsing response: " + e.message);
            }
        });
        if (!ip) {
            reject("⚠️ Please provide device IP");
            return;
        }
        const payload = { message: "decode", IP: ip, useStandard: useStandard };
        console.log("📤 Sending payload:", payload);
        sendMessage(payload);
    });
}
