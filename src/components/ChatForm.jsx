import { useRef, useState, useEffect } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse, language }) => {
    const inputRef = useRef();
    const voiceButtonRef = useRef();
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if ("webkitSpeechRecognition" in window) {
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            const newRecognition = new SpeechRecognition();
            newRecognition.lang = language === "en" ? "it-IT" : "en-US"; // chọn language
            newRecognition.interimResults = false;
            newRecognition.continuous = true; // để nói dài

            newRecognition.onresult = (event) => {
                const transcript =
                    event.results[event.results.length - 1][0].transcript;
                inputRef.current.value = transcript;
            };

            newRecognition.onend = () => {
                setIsRecording(false);
                if (voiceButtonRef.current) {
                    voiceButtonRef.current.style.color = "";
                }
            };

            newRecognition.onerror = (event) => {
                console.error("Voice recognition error:", event.error);
                setIsRecording(false);
                if (voiceButtonRef.current) {
                    voiceButtonRef.current.style.color = "";
                }
            };

            recognitionRef.current = newRecognition;
        } else {
            console.warn("The browser does not support Web Speech API.");
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [language]);

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

    const startRecording = () => {
        if (recognitionRef.current && !isRecording) {
            recognitionRef.current.start();
            setIsRecording(true);
            if (voiceButtonRef.current) {
                voiceButtonRef.current.style.color = "red";
            }
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
            if (voiceButtonRef.current) {
                voiceButtonRef.current.style.color = "";
            }
        }
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
            <button
                ref={voiceButtonRef}
                style={{ display: "block" }}
                id="voice-button"
                className="material-symbols-outlined"
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
            >
                mic
            </button>
            <button type="submit" className="material-symbols-outlined">
                send
            </button>
        </form>
    );
};

export default ChatForm;
