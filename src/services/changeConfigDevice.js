    import { sendMessage, addMessageListener } from "./socketClient";
    export async function changeConfigDevice(ip, configName =null, config, serial = null, timeout = 5000) {
    return new Promise((resolve, reject) => {
        let ackReceived = false;
        const removeListener = addMessageListener((msg) => {
        if (msg === "ACK") {
            ackReceived = true;
            console.log("✅ ACK received, waiting for JSON...");
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
                    resolve("✅ Config changed successfully.");
                } else {
                    console.log(`❌ ${messages.join("\n") || "Failed to change device config."}`);
                }
                //removeListener();
        } catch (e) {
            reject("❌ Error parsing response: " + e.message);
            removeListener();
        }
        });
        const payload = { message: "changeConfig", IP: ip, config };
        if (serial) payload.serial = serial
        if (configName) payload.configName = configName;
        console.log(payload)
        sendMessage(payload);
        // timeout
        setTimeout(() => {
        if (!ackReceived) {
            reject("❌ Server is down, cannot perform communication actions with device.");
            removeListener();
        }
        }, timeout);
    });
    }
