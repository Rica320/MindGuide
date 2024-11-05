import { listener, stopListener } from '../services/speechToText/listener';
import '../styles/App.css';
import { useState } from 'react';

function App() {
  const [isListening, setIsListening] = useState(undefined);

  const toggleConversation = () => {

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
