import env from "../config";
import "../styles/App.css";
import { useState } from "react";
if (env === "production") {
  var { getModeratorResponse } = require("../services/LLM/llm_model");
  var { listener, stopListener } = require("../services/speechToText/listener");
}

function App() {
  const [isListening, setIsListening] = useState(undefined);
  const env = "test"; // 'production' or 'test'
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

  return (
    <div className="App">
      <header className="App-header">
        <div className="Hello-World">
          <h1>Hello World</h1>
        </div>
        <button
          onClick={toggleConversation}
          className="start-conversation-button"
        >
          {isListening ? "Stop Conversation" : "Start Conversation"}
        </button>
      </header>
    </div>
  );
}

export default App;
