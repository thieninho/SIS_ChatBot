import { useRef, useState, useEffect } from "react";
    const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse, language }) => {
    const inputRef = useRef();
    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const audioContextRef = useRef();
    const analyserRef = useRef();
    const sourceRef = useRef();
    const mediaStreamRef = useRef();
    const silenceTimerRef = useRef(null);
    const [volume, setVolume] = useState(0);

    useEffect(() => {
        if ("webkitSpeechRecognition" in window) {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        const newRecognition = new SpeechRecognition();
        newRecognition.lang = language || "en-US";
        newRecognition.interimResults = true;
        newRecognition.continuous = true;

        newRecognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
            finalTranscript += transcript;
            } else {
            interimTranscript += transcript;
            }
        }

        finalTranscript = finalTranscript.trim().replace(/\.$/, "");
        interimTranscript = interimTranscript.trim().replace(/\.$/, "");

        if (inputRef.current) {
            inputRef.current.value = finalTranscript + interimTranscript;
        }

        // Reset silence timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        // Nếu im lặng 3s => coi như nói xong => gọi handleFormSubmit
        silenceTimerRef.current = setTimeout(() => {
            if (inputRef.current && inputRef.current.value.trim()) {
                silenceTimerRef.current = setTimeout(() => {
                    if (inputRef.current && inputRef.current.value.trim()) {
                        inputRef.current.form.requestSubmit(); // <-- gửi form thật
                    }
}, 1500);

            }
        }, 1500);
        };


        newRecognition.onerror = (e) => {
            console.error("Recognition error:", e.error);
        };

        setRecognition(newRecognition);
        } else {
        console.warn("The browser does not support Web Speech API.");
        }

        return () => stopRecording();
    }, []);

    const startRecording = async () => {
        if (!recognition) return;
        try {
        recognition.start();
        setIsRecording(true);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        audioContextRef.current = new (window.AudioContext ||
            window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);

        trackVolume();
        } catch (err) {
        console.error("Microphone access error:", err);
        stopRecording();
        }
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (recognition) {
        recognition.onend = () => {
            // recreate recognition instance
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            const newRecognition = new SpeechRecognition();
            newRecognition.lang = language || "en-US";
            newRecognition.interimResults = true;
            newRecognition.continuous = true;

            newRecognition.onresult = recognition.onresult; // copy handlers
            newRecognition.onerror = recognition.onerror;

            setRecognition(newRecognition);
        };
        recognition.stop();
    }


        if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
        }

        if (sourceRef.current) sourceRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        }

        analyserRef.current = null;
        sourceRef.current = null;
        audioContextRef.current = null;
        mediaStreamRef.current = null;
        setVolume(0);
    };

    const trackVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const update = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg =
            dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
        setVolume(avg); // 0 → 1
        requestAnimationFrame(update);
        };
        update();
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userMessage = inputRef.current.value.trim();
        if (!userMessage) return;
        inputRef.current.value = "";

        setChatHistory((history) => [
        ...history,
        { role: "user", text: userMessage },
        ]);
        setTimeout(
        () =>
            setChatHistory((history) => [
            ...history,
            { role: "model", text: "Thinking..." },
            ]),
        600
        );

        generateBotResponse([
        ...chatHistory,
        {
            role: "user",
            text: `Using the details provided above, please address this query: ${userMessage}`,
        },
        ]);
    };

    return (
        <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
        <input
            ref={inputRef}
            type="text"
            placeholder="Input your message..."
            className="message-input"
            required
        />

        {isRecording ? (
    <div style={{ position: "relative", display: "inline-block" }}>
        {/* Ripple effect */}
        {/* <span
        style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "#ff0000",
            animation: "ripple 1.5s infinite",
            zIndex: 0,
        }}
        />
        <span
        style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "#ff0000",
            transform: "translate(-50%, -50%) scale(0.5)",
            animation: "ripple 1.5s infinite 0.5s", // delay cho layer thứ 2
            zIndex: 0,
        }}
        /> */}
        <button
        style={{
            display: "block",
            background: "#ff0000",
            position: "relative",
            zIndex: 1,
            borderRadius: "50%",
        }}
        type="button"
        onClick={stopRecording}
        className="material-symbols-outlined mic-button"
        >
        stop
        </button>
    </div>
    ) : (
    <button
        style={{ display: "block" }}
        type="button"
        onClick={startRecording}
        className="material-symbols-outlined mic-button"
    >
        mic
    </button>
    )}
        <button type="submit" className="material-symbols-outlined">
            send
        </button>
        </form>
    );
    };

    export default ChatForm;
