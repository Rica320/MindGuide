import { listener, stopListener } from '../services/speechToText/listener';
import '../styles/App.css';
import { useState } from 'react';
import { getModeratorResponse } from '../services/LLM/llm_model';

function App() {
  const [isListening, setIsListening] = useState(undefined);

  const toggleConversation = () => {

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
  };

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={toggleConversation} className="start-conversation-button">
          {isListening ? 'Stop Conversation' : 'Start Conversation'}
        </button>
      </header>
    </div>
  );
}

export default App;
