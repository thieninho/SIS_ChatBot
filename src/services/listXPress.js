    import { sendMessage, addMessageListener } from "./socketClient";

    export async function listXPress(ip) {
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
            resolve({
                type: "success",
                ip,
                results: data.results,
                errorCode: data.errorCode || 0,
            });
            } else {
            reject({
                type: "error",
                message: data.message || "❌ Failed to get XPRESS list",
                errorCode: data.errorCode || 1,
            });
            }
            removeListener();
        } catch (e) {
            reject({ type: "error", message: "Error parsing response: " + e.message });
            removeListener();
        }
        });

        sendMessage({ message: "xpressList", IP: ip });

        setTimeout(() => {
        if (!ackReceived) {
            reject({ type: "error", message: "❌ Server did not respond with ACK" });
            removeListener();
        }
        }, 3000);
    });
    }
