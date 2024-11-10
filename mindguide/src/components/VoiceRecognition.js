import React, { useEffect, useState } from "react";
import GeminiComponentWrapper from "./GeminiComponentWrapper";

const VoiceRecognition = () => {
  const [prompt, setPrompt] = useState(null);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const startChatButton = document.querySelector(".start-chat-button");
    const startRecognition = () => {
      startChatButton.style.display = "none";
      const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = function (event) {
        const voiceInput = event.results[0][0].transcript;
        setPrompt(voiceInput);
      };

      recognition.onerror = function (event) {
        console.error("Speech recognition error detected: " + event.error);
      };

      recognition.start();
    };

    startChatButton.addEventListener("click", function (event) {
      event.preventDefault();
      startRecognition();
      setInterval(startRecognition, 10000);
    });
  }, []);

  return (
    <div>
      <button className="start-chat-button">Start Chat</button>
      {prompt && (
        <GeminiComponentWrapper
          prompt={prompt}
          onResponse={(response) => {
            if (typeof response === "string") {
              setResponse(response);
            }
          }}
        />
      )}
      {response && (
        <div class="voice-recognition-response">Response: {response}</div>
      )}
    </div>
  );
};

export default VoiceRecognition;
