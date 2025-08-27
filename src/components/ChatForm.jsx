import { useRef, useState, useEffect } from "react";

const ChatForm = ({chatHistory, setChatHistory, generateBotResponse, language}) => {
    const inputRef = useRef();
    const voiceButtonRef = useRef();
    const [isRecording, setIsRecording] = useState(false); 
    const [recognition, setRecognition] = useState(null); 
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const newRecognition = new SpeechRecognition();
            newRecognition.lang = 'en-US';
            newRecognition.interimResults = false;
            newRecognition.continuous = false;

            newRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                inputRef.current.value = transcript;
                setIsRecording(false);
            };

            newRecognition.onend = () => {
                setIsRecording(false);
                if (voiceButtonRef.current) {
                    voiceButtonRef.current.style.color = ''; 
                }
            };

            newRecognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                setIsRecording(false);
                if (voiceButtonRef.current) {
                    voiceButtonRef.current.style.color = '';
                }
            };

            setRecognition(newRecognition);
        } else {
            console.warn("The browser does not support Web Speech API.");
        }

        return () => {
            if (recognition) {
                recognition.stop();
            }
        };
    }, []);
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userMessage = inputRef.current.value.trim();
        if (!userMessage) return;
        inputRef.current.value = ""
        setChatHistory(history => [...history, {role: "user", text: userMessage}]);
        setTimeout(() => setChatHistory(history => [...history, { role: "model", text: "Thinking..."}]), 600);
        generateBotResponse([...chatHistory, {role: "user", text: `Using the details provided above, please address this query: ${userMessage}`}]);
    }
    const handleVoiceButtonClick = (e) => {
        e.preventDefault();
        if (!recognition) return;

        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
            setIsRecording(true);
            if (voiceButtonRef.current) {
                voiceButtonRef.current.style.color = 'red'; 
            }
        }
    };
    return (
        <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
            <input ref={inputRef} type="text" placeholder="Input your message..." className="message-input" required/>
            <button
                ref={voiceButtonRef}
                onClick={handleVoiceButtonClick}
                style={{display: "block"}}
                id="voice-button"
                className="material-symbols-outlined"
                type="button"
            >
                mic
            </button>
            <button type="submit" className="material-symbols-outlined">send</button>
        </form>
    )
}

export default ChatForm
