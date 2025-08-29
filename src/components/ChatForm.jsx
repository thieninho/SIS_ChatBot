    import { useRef, useState, useEffect } from "react";

    const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse, language }) => {
    const inputRef = useRef();
    const canvasRef = useRef();
    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const animationRef = useRef();
    const audioContextRef = useRef();
    const analyserRef = useRef();
    const sourceRef = useRef();
    const mediaStreamRef = useRef();

    useEffect(() => {
        if ("webkitSpeechRecognition" in window) {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        const newRecognition = new SpeechRecognition();
        newRecognition.lang = "en-US";
        newRecognition.interimResults = true;   // transcript liên tục
        newRecognition.continuous = true;       // không tự end

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

            // Cập nhật realtime transcript trong input
            if (inputRef.current) {
            inputRef.current.value = finalTranscript + interimTranscript;
            }
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

        drawWaveform();
        } catch (err) {
        console.error("Microphone access error:", err);
        stopRecording();
        }
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (recognition) recognition.stop();

        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (sourceRef.current) sourceRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        }

        analyserRef.current = null;
        sourceRef.current = null;
        audioContextRef.current = null;
        mediaStreamRef.current = null;

        const canvas = canvasRef.current;
        if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const drawWaveform = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
        animationRef.current = requestAnimationFrame(draw);

        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 4;
            ctx.fillStyle = "#ff0000ff";
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
        };
        draw();
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

        {/* waveform nhỏ gọn */}
        <canvas
            ref={canvasRef}
            width="80px"
            height="20px"
            style={{
            display: isRecording ? "inline-block" : "none",
            background: "#fff",
            borderRadius: "4px",
            margin: "0 8px",
            }}
        ></canvas>
            {isRecording ? (
            <button
            style={{display: "block",
                    background: "#ff0000ff",
            }}
            type="button"
            onClick={stopRecording}
            className="material-symbols-outlined"
            >
            stop
            </button>
        ) : (
            <button
            style={{display: "block"}}
            type="button"
            onClick={startRecording}
            className="material-symbols-outlined"
            >
            mic
            </button>
        )}

        <button 
        type="submit" className="material-symbols-outlined"
        onClick={stopRecording}
        >
            send
        </button>
        </form>
    );
    };

    export default ChatForm;
