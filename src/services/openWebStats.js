    export async function openWebStatistics(ip, timeout = 2000) {
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
            message: `Opened web page at http://${ip}/statistics`,
            errorCode: 0,
            ip
        };
        console.log(response.message)
        resolve(response.message);
        window.open(`http://${ip}/statistics`, "myNewWindow", "width=1060,height=740,left=100,top=100");
        } catch (err) {
        reject({
            type: "error",
            message: "❌ Failed to open Web Monitor",
            errorCode: 1
        });
        }
    });
    }