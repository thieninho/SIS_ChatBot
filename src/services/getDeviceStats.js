import { sendMessage, addMessageListener } from "./socketClient";

export async function getDeviceStatistics(ip) {
    return new Promise((resolve, reject) => {
        let ackReceived = false;
        let responseTimeout;

        const removeListener = addMessageListener((msg) => {
            if (msg === "ACK") {
                ackReceived = true;
                console.log("✅ ACK received for GetStatistics");

                // set timeout chờ data sau ACK
                responseTimeout = setTimeout(() => {
                    reject("❌ Timeout: No statistics data received after ACK.");
                    removeListener();
                }, 5000);

                return;
            }

            try {
                const data = JSON.parse(msg);

                if (!ackReceived) {
                    reject("❌ No ACK before data");
                    removeListener();
                    return;
                }

                clearTimeout(responseTimeout);

                if (data.type === "success") {
                    resolve({
                        type: "success",
                        ip,
                        results: data.data,
                        errorCode: data.errorCode || 0,
                    });
                } else {
                    reject({
                        type: "error",
                        message: data.message || "❌ Failed to retrieve statistics.",
                        errorCode: data.errorCode || 1,
                    });
                }
                removeListener();
            } catch (e) {
                reject("Error parsing response: " + e.message);
                removeListener();
            }
        });

        // gửi request
        sendMessage({
            message: "getStatistics",
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
