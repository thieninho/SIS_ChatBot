import { sendMessage, addMessageListener } from "./socketClient";

export async function discoverDevices(timeout = 10000) {
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
                reject("❌ No ACK before data");
                removeListener();
                return;
            }

            const results = data.results || [];
            if (results.length === 0) {
                resolve("No devices found.");
                removeListener();
                return;
            }

            let output = "✅ Discovered devices:\n";
            results.forEach((res) => {
                if (res.devices.length === 0) {
                    //output += `- IP: ${res.ipAddress}: No devices\n`;
                } else {
                    
                res.devices.forEach((dev) => {
                    if (dev.isSimulator == "False") {
                        output += `- ${dev.family}; IP: ${dev.address}; Serial: ${dev.serial} \n`;
                    }
                    // MAC: ${dev.mac}
                });
                }
            });

            resolve(output.trim());
            removeListener();
            } catch (e) {
            reject("Error parsing response: " + e.message);
            removeListener();
            }
        });

        // gửi discover
        sendMessage({ message: "discover" });

        // timeout
        setTimeout(() => {
            if (!ackReceived) {
            reject("❌ Server is down, cannot perform communication actions with device.");
            removeListener();
            }
        }, 3000);
        });
    }
