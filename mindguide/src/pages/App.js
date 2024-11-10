import env from "../config";
import "../styles/App.css";
import { useEffect, useState } from "react";
import VoiceRecognition from "../components/VoiceRecognition";
if (env === "production") {
  var { getModeratorResponse } = require("../services/LLM/llm_model");
  var { listener, stopListener } = require("../services/speechToText/listener");
}

function App() {
  const [isListening, setIsListening] = useState(undefined);
  const [svgContent, setSvgContent] = useState("");

  useEffect(() => {
    fetch("/planet_svg.html")
      .then((response) => response.text())
      .then((data) => setSvgContent(data));
  }, []);
  const toggleConversation = () => {
    if (env === "production") {
      // send message to start conversation
      getModeratorResponse("user", "start conversation").then((response) => {
        console.log("Moderator Response: ", response);
        // speakText(response);
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(response));
      });

      if (isListening) {
        stopListener();
      } else {
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
          <button
            onClick={toggleConversation}
            className="start-conversation-button"
          >
            {isListening ? "Stop Conversation" : "Start Conversation"}
          </button>
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
