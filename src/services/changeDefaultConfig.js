import { sendMessage, addMessageListener } from "./socketClient";

    export async function changeDefaultConfig() {
    return new Promise((resolve, reject) => {
        let ackReceived = false;

        const removeListener = addMessageListener((msg) => {
        if (msg === "ACK") {
            ackReceived = true;
            console.log("✅ ACK for changeDefaultConfig");
            return;
        }

        try {
            const data = JSON.parse(msg);

            if (!ackReceived) {
                reject("❌ No ACK before response");
                removeListener();
            return;
            }

            if (data.type === "success") {
                resolve(`${data.message}`);
            } else {
                reject("To change default config. Please open an HMP connection.");
            }
            removeListener();
        } catch (err) {
            reject("Error parsing response: " + err.message);
            removeListener();
        }
        });
        sendMessage({ message: "changeDefaultConfig" });

        // timeout
        setTimeout(() => {
        if (!ackReceived) {
            reject("❌ Server is down, cannot perform communication actions with device.");
            removeListener();
        }
        }, 3000);
    });
    }
