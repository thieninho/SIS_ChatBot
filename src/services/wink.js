    import { sendMessage, addMessageListener } from "./socketClient";

    export async function winkDevice(arg) {
    return new Promise((resolve, reject) => {
        let ackReceived = false;

        const removeListener = addMessageListener((msg) => {
        if (msg === "ACK") {
            ackReceived = true;
            console.log("✅ ACK received for wink");
            return;
        }

        try {
            const data = JSON.parse(msg);

            if (!ackReceived) {
            reject("❌ No ACK before data");
            removeListener();
            return;
            }

            if (data.message) {
            resolve(`✅ ${data.message}`);
            } else {
            resolve(JSON.stringify(data));
            }
            removeListener();
        } catch (e) {
            reject("Error parsing response: " + e.message);
            removeListener();
        }
        });

        if (!arg) {
        reject("⚠️ Please provide device serial or IP");
        removeListener();
        return;
        }

        // Chuẩn bị payload
        const payload = { message: "wink" };

        // Nếu là IP → cho vào IP, nếu không thì coi như serial
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(arg)) {
        payload.IP = arg;
        } else {
        payload.serial = arg;
        }

        sendMessage(payload);

        // timeout nếu không nhận ACK
        setTimeout(() => {
        if (!ackReceived) {
            reject("❌ Server is down, cannot perform communication actions with device.");
            removeListener();
        }
        }, 3000);
    });
}
