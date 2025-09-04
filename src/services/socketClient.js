    let socket = null;
    let listeners = [];

    export function initSocket(url = "ws://10.84.31.54:3000") {
    if (socket) return socket; // tránh tạo lại nhiều lần
    console.log("CẢNH BÁO! KHÔNG CÓ GÌ ĐÂU HEHE")
    socket = new WebSocket(url);

    socket.onopen = () => {
        console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
        const msg = event.data;
        listeners.forEach((cb) => cb(msg)); 
    };

    socket.onerror = (err) => {
        reject(
            "Server is down, cannot perform communication actions with device."
        );
    };

    socket.onclose = () => {
        socket = null;
    };
    
    return socket;
    }

    export function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.warn("⚠️ Socket not ready, message not sent:", message);
    }
    }

    export function addMessageListener(callback) {
    listeners.push(callback);
    return () => {
        listeners = listeners.filter((cb) => cb !== callback);
    };
}
