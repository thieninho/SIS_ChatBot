    import { sendMessage, addMessageListener } from "./socketClient";

    export async function changeDeviceIP(oldIP, newIP, serial = null, timeout = 5000) {
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

            if (data.type === "success") {
            const results = data.results || [];

            if (results.length === 0) {
                resolve("IP changed, but no devices found.");
                removeListener();
                return;
            }

            // format giống discover
            let output = "IP changed successfully. Updated devices:\n";
            results.forEach((res) => {
                if (res.devices.length === 0) {
                    //output += `- IP: ${res.ipAddress}: No devices\n`;
                } else {
                res.devices.forEach((dev) => {
                    output += `- ${dev.family}; IP: ${dev.address}; Serial: ${dev.serial}\n`;
                });
                }
            });

            resolve(output.trim());
            } else if (data.type === "error") {
            resolve(`❌ ${data.message || "Failed to change device IP"}`);
            } else {
            resolve("⚠️ Unexpected response: " + msg);
            }

            removeListener();
        } catch (e) {
            reject("❌ Error parsing response: " + e.message);
            removeListener();
        }
        });

        // gửi changeIP
        const payload = { message: "changeIP", IP: oldIP, newIP };
        if (serial) payload.serial = serial;

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
