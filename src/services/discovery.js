import { sendMessage, addMessageListener } from "./socketClient";

export async function discoverDevices(timeout = 10000) {
    return new Promise((resolve, reject) => {
        let ackReceived = false;
        let timeoutId;

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
                    clearTimeout(timeoutId);
                    return;
                }

                const results = data.results || [];
                if (results.length === 0) {
                    resolve([]);
                    removeListener();
                    clearTimeout(timeoutId);
                    return;
                }

                // ✅ Chuẩn hóa dữ liệu về dạng [{ ip, model, serial }]
                const devices = results.flatMap((res) =>
                    res.devices
                        .filter((dev) => dev.isSimulator === "False")
                        .map((dev) => ({
                            ip: dev.address,
                            model: dev.family,
                            serial: dev.serial,
                        }))
                );

                console.log("✅ Discovered devices:", devices);
                resolve(devices);

                removeListener();
                clearTimeout(timeoutId);
            } catch (e) {
                reject("Error parsing response: " + e.message);
                removeListener();
                clearTimeout(timeoutId);
            }
        });

        // Gửi lệnh discover
        sendMessage({ message: "discover" });

        // Timeout (3 giây hoặc dùng timeout param)
        timeoutId = setTimeout(() => {
            if (!ackReceived) {
                reject("❌ Server is down, cannot perform communication actions with device.");
                removeListener();
            }
        }, timeout);
    });
}
