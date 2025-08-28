    import { sendMessage, addMessageListener } from "./socketClient";

    export async function xpressFunction(fn) {
    return new Promise((resolve, reject) => {
        let ackReceived = false;

        const removeListener = addMessageListener((msg) => {
        if (msg === "ACK") {
            ackReceived = true;
            console.log("✅ ACK received for XPRESS");
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
                resolve(`${data.message} Please ensure that the device has completed execution before proceeding with the next action.`);
            } 
            else if (data.type === "error") {
                reject(data.message || "❌ Failed to execute Xpress function.");
            }
            removeListener();
        } catch (e) {
            reject("Error parsing response: " + e.message);
            removeListener();
        }
        });

        // gửi request
        sendMessage({
        message: "xpressFunction",
        function: fn, // XPRESS 1, XPRESS 2, ...
        });

        // timeout
        setTimeout(() => {
        if (!ackReceived) {
            reject("❌ Server is down, cannot perform communication actions with device.");
            removeListener();
        }
        }, 3000);
    });
    }
