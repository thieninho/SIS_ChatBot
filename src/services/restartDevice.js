import { sendMessage, addMessageListener } from "./socketClient";

    export async function restartDevice(arg) {
    return new Promise((resolve, reject) => {
        let ackReceived = false;

        const removeListener = addMessageListener((msg) => {
        if (msg === "ACK") {
            ackReceived = true;
            console.log("✅ ACK received for wink");
            return;
        }
        ///////////////////////////////

        //////////////////////////////
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
                //removeListener();
        } catch (e) {
            reject("❌ Error parsing response: " + e.message);
            removeListener();
        }
        });

        if (!arg) {
        reject("⚠️ Please provide device serial or IP");
        removeListener();
        return;
        }

        const payload = { message: "restartDevice" };

        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(arg)) {
        payload.IP = arg;
        }

        sendMessage(payload);

        setTimeout(() => {
        if (!ackReceived) {
            reject("❌ Server is down, cannot perform communication actions with device.");
            removeListener();
        }
        }, 3000);
    });
}
