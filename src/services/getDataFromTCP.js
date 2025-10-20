import { sendMessage, addMessageListener } from "./socketClient";

export async function getDataFromTCP(ip, port = 51236, time = 5000) {
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
                if (data.type === "success") {
                    cleanup();
                    resolve(data);
                } else {
                    cleanup();
                    reject(data.message || "❌ Failed to retrieve data.");
                }
                removeListener();
            } catch (e) {
                cleanup();
                reject("❌ Error parsing response: " + e.message);
            }
        });
        if (!ip) {
            reject("⚠️ Please provide device IP");
            return;
        }
        const payload = { message: "getDataFromTCP", IP: ip, port, time };
        console.log("📤 Sending payload:", payload);
        sendMessage(payload);
    });
}
