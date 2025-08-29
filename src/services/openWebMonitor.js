    export async function openWebMonitor(ip, timeout = 2000) {
    return new Promise((resolve, reject) => {
        try {
        if (!ip) {
            reject({
            type: "error",
            message: "❌ No IP provided",
            errorCode: 1
            });
            return;
        }

        // Tạo response object
        const response = {
            type: "success",
            message: `Opened Web Monitor at http://${ip}`,
            errorCode: 0,
            ip
        };
        console.log(response.message)
        resolve(response.message);
        window.open(`http://${ip}`, "_blank");

        } catch (err) {
        reject({
            type: "error",
            message: "❌ Failed to open Web Monitor",
            errorCode: 1
        });
        }
    });
    }