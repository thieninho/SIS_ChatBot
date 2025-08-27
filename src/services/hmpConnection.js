    import { sendMessage, addMessageListener } from "./socketClient";

    export async function openHMP(ip, port = 1023) {
    return new Promise((resolve, reject) => {
        let ackReceived = false;

        const removeListener = addMessageListener((msg) => {
        if (msg === "ACK") {
            ackReceived = true;
            console.log("✅ ACK received");
            return;
        }

        try {
            const data = JSON.parse(msg);

            if (!ackReceived) {
            reject("❌ No ACK before data");
            removeListener();
            return;
            }

            if (data.type === "success") {
                resolve(`✅ ${data.message}`); // "HMP connection opened."
            } else {
                reject(data.message || "Failed to open HMP connection.");
            }

            removeListener();
        } catch (e) {
            reject("Error parsing response: " + e.message);
            removeListener();
        }
        });

        sendMessage({ message: "openHMP", IP: ip, port });

        setTimeout(() => {
        if (!ackReceived) {
            reject("❌ Server did not respond with ACK");
            removeListener();
        }
        }, 3000);
    });
    }

    export async function closeHMP(ip, port = 1023) {
    return new Promise((resolve, reject) => {
        let ackReceived = false;

        const removeListener = addMessageListener((msg) => {
        if (msg === "ACK") {
            ackReceived = true;
            console.log("✅ ACK received");
            return;
        }

        try {
            const data = JSON.parse(msg);

            if (!ackReceived) {
            reject("❌ No ACK before data");
            removeListener();
            return;
            }

            if (data.type === "success") {
            resolve(`✅ ${data.message}`); // "HMP connection closed."
            } else {
            reject(data.message || "Failed to close HMP connection.");
            }

            removeListener();
        } catch (e) {
            reject("Error parsing response: " + e.message);
            removeListener();
        }
        });

        sendMessage({ message: "closeHMP", IP: ip, port });

        setTimeout(() => {
        if (!ackReceived) {
            reject("❌ Server is down, cannot perform communication actions with device.");
            removeListener();
        }
        }, 3000);
    });
    }
