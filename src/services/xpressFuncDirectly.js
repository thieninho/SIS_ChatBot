import { sendMessage, addMessageListener } from "./socketClient";

export async function xpressFunctionDirectly(fn, ip) {
    return new Promise((resolve, reject) => {
        let ackReceived = false;

        const removeListener = addMessageListener((msg) => {
            if (msg === "ACK") {
                ackReceived = true;
                console.log("✅ ACK received for XPRESS Directly");
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
                    resolve(`${data.message}`);
                } 
                else if (data.type === "error") {
                    reject("Failed to execute Xpress function directly.");
                }
                removeListener();
            } catch (e) {
                reject("Error parsing response: " + e.message);
                removeListener();
            }
        });

        sendMessage({
            message: "xpressFunctionDirectly",
            function: fn,     
            IP: ip            
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
