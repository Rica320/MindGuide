import React, { useState, useEffect, useCallback, useRef } from "react";
import GeminiComponentWrapper from "./GeminiComponentWrapper";

const VoiceRecognition = () => {
  const [prompt, setPrompt] = useState(null);
  const [response, setResponse] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [showStopButton, setShowStopButton] = useState(false);
  const [recognitionInterval, setRecognitionInterval] = useState(null);
  const startChatButtonRef = useRef(null);

  const startRecognition = useCallback(() => {
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

    recognition.onend = function () {
      setIsRecognizing(false);
    };

    recognition.start();
    window.recognition = recognition;
    setIsRecognizing(true);
    setShowStopButton(true);
  }, []);

  const startRecognitionInterval = useCallback(() => {
    startRecognition();
    const interval = setInterval(() => {
      startRecognition();
    }, 10000); // 10 seconds
    setRecognitionInterval(interval);
  }, [startRecognition]);

  const stopRecognition = () => {
    if (window.recognition && window.recognition.state !== "inactive") {
      window.recognition.stop();
      setIsRecognizing(false);
      clearInterval(recognitionInterval);
      setRecognitionInterval(null);
      setShowStopButton(false);
    }
  };

  useEffect(() => {
    const startChatButton = startChatButtonRef.current;
    const handleClick = (event) => {
      event.preventDefault();
      startRecognitionInterval();
    };

    if (startChatButton) {
      startChatButton.addEventListener("click", handleClick);
    }

    return () => {
      if (startChatButton) {
        startChatButton.removeEventListener("click", handleClick);
      }
      if (recognitionInterval) {
        clearInterval(recognitionInterval);
      }
    };
  }, [startRecognitionInterval, recognitionInterval]);

  return (
    <div>
      {!showStopButton && (
        <button ref={startChatButtonRef} className="start-chat-button">
          Start Chat
        </button>
      )}
      {showStopButton && (
        <button
          className="stop-chat-button"
          onClick={stopRecognition}
          disabled={!isRecognizing}
        >
          Stop Chat
        </button>
      )}
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
        <div className="voice-recognition-response">Response: {response}</div>
      )}
    </div>
  );
};

export default VoiceRecognition;
