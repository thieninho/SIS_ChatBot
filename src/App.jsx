import ChatbotIcon from "./components/ChatbotIcon";
import DatalogicIcon from "./components/DatalogicIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { useEffect, useRef, useState } from "react";
import { companyInfo } from "./promt_data/userpromt";
import { initSocket } from "./services/socketClient";
import { generateBotResponse } from "./utils/generateBotResponse";


const App = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);
  const [showChatbot, setShowChatbot] = useState(false); 
  const chatBodyRef = useRef();
    useEffect(() => {
    initSocket(); 
  }, []);
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button onClick={() => setShowChatbot(prev => !prev)} 
      id="chatbot-toggler">
        <span className="material-symbols-outlined">mode_comment</span>
        <span className="material-symbols-outlined">close</span>
      </button>
      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <DatalogicIcon />
            {/* <h2 className="logo-text">SIS chatbot</h2> */}
          </div>
          <button onClick={() => setShowChatbot(prev => !prev)}  className="material-symbols-outlined">
            keyboard_arrow_down
          </button>
        </div>

        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">How can I help you?</p>
          </div>
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={(history) =>
              generateBotResponse(history, setChatHistory)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default App;
