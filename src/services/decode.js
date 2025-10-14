import { sendMessage, addMessageListener } from "./socketClient";

export async function decodeFunction(ip) {
    return new Promise((resolve, reject) => {
        let ackReceived = false;
        let responseTimeout;

        const removeListener = addMessageListener((msg) => {
            if (msg === "ACK") {
                ackReceived = true;
                console.log("✅ ACK received for Decode Function");

                // timeout chờ response sau ACK
                responseTimeout = setTimeout(() => {
                    reject("❌ Timeout: No decode response after ACK.");
                    removeListener();
                }, 5000);
                return;
            }

            try {
                const data = JSON.parse(msg);

                if (!ackReceived) {
                    reject("❌ No ACK before response");
                    removeListener();
                    return;
                }

                let messages = [];
                
                if (Array.isArray(data.message)) {
                    messages = data.message;
                } else if (typeof data.message === "object" && data.message !== null) {
                    messages = Object.values(data.message);
                } else if (data.message) {
                    messages = [data.message];
                }
                if (data.type === "success") {
                    for (let i = 0; i < messages.length; i++) {
                        const m = messages[i];
                        resolve(m);
                    }
                    resolve("Config changed successfully.");
                } else {
                    console.log(`❌ ${messages.join("\n") || "Failed to change device config."}`);
                }
                removeListener();
            } catch (e) {
                reject("Error parsing response: " + e.message);
                removeListener();
            }
        });

        // gửi request
        sendMessage({
            message: "decode",
            IP: ip,
        });

        // timeout chờ ACK
        setTimeout(() => {
            if (!ackReceived) {
                reject("❌ Server is down, cannot perform communication actions with device.");
                removeListener();
            }
        }, 3000);
    });
}
