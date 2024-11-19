import env from "../config";
import "../styles/App.css";
import { useEffect, useState } from "react";
import VoiceRecognition from "../components/VoiceRecognition";
import log from "../utils/logger";

if (env === "production") {
  var { getModeratorResponse } = require("../services/LLM/llm_model");
  var { listener, stopListener } = require("../services/speechToText/listener");
}

function App() {
  const [isListening, setIsListening] = useState(false);
  const [svgContent, setSvgContent] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetch("/planet_svg.html")
      .then((response) => response.text())
      .then((data) => setSvgContent(data));
  }, []);
  const toggleConversation = () => {
    if (env === "production") {
      
      if (isListening) {
        stopListener();
      } else {
        // send message to start conversation
        getModeratorResponse("user", "start conversation").then((response) => {
        console.log("Moderator Response: ", response);
        log.info("Moderator: ", response);
        // speakText(response);
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(response));
      });
      listener();
      }
      setIsListening(!isListening);
    } else {
      alert("This feature is not available in development mode");
    }
  };

  if (env === "production") {
    return (
      <div className="App">
        <header className="App-header">
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            style={{ width: "100%", height: "100%" }}
          />
          <div className="fixed bottom-8 right-8 flex gap-4">
            {/* Stop Button */}
            {isListening ? (
              <button
                className="stop-button"
                onClick={toggleConversation}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label="Stop conversation"
              >
                <svg
                  className="icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ) : (
              <button
                onClick={toggleConversation}
                className="chat-button pulse"
                aria-label="Start conversation"
              >
                <svg
                  className="chat-icon"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                </svg>
              </button>
            )}
          </div>
        </header>
      </div>
    );
  } else {
    return (
      <div className="App">
        <header className="App-header">
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            style={{ width: "100%", height: "100%" }}
          />
          <VoiceRecognition />
        </header>
      </div>
    );
  }
}

export default App;
