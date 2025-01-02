import env from "../config";
import "../styles/App.css";
import { useEffect, useState } from "react";
import VoiceRecognition from "../components/VoiceRecognition";
import log from "../utils/logger";
import HandIcon from "../assets/stop-hand.svg";

const { usePolly, speakText } = require("../services/textToSpeech/pollySpeak");
console.log("use polly = ", usePolly);

if (env === "production") {
  var { getModeratorResponse } = require("../services/LLM/llm_model");
  var { listener, stopListener, endSession } = require("../services/speechToText/listener");
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
        let selectedModel = document.getElementById("model-select").value;
        let selectedParticipants = document.getElementById("participant-select").value;
        getModeratorResponse('(Start the session now and make sure everyone introduces themselves by their name at first)', selectedModel, selectedParticipants).then(
          (response) => {
            log.info("Moderator: ", response);

            if (!usePolly) {
              // with browser speech synthesis
              const utterance = new SpeechSynthesisUtterance(response);
              document.querySelector(".App-header").classList.add("blue");
              utterance.onend = () => document.querySelector(".App-header").classList.remove("blue");
              window.speechSynthesis.speak(utterance);
            } else {
              // with polly
              speakText(response);
            }
          }
        );
        listener(selectedModel, selectedParticipants);
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
          <div className="cute-select-container">
            {/* role selector */}
            {isListening ? (<div> </div>) : (<div>
              <div className="select-container">
                <div className="select-wrapper">
                  <label htmlFor="model-select">MindGuide type:</label>
                  <select
                    id="model-select"
                    onChange={(e) => {
                      const selectedModel = e.target.value;
                      log.info("Selected Model: ", selectedModel);
                    }}
                  >
                    <option value="moderator">Moderator</option>
                    <option value="empathic">Empathic</option>
                    <option value="peer">Peer</option>
                  </select>
                </div>
                <div className="select-wrapper">
                  <label htmlFor="participant-select">Number of Participants:</label>
                  <select
                    id="participant-select"
                    onChange={(e) => {
                      const selectedParticipants = e.target.value;
                      log.info("Selected Participants: ", selectedParticipants);
                    }}
                  >
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>
            </div>
            )}
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            style={{ width: "100%", height: "100%" }}
          />
          <div className="button-container">
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

            {/* Terminate Button */}
            {isListening && (
              <button
                className="terminate-button"
                onClick={() => {
                  endSession();
                  window.speechSynthesis.cancel();
                  document
                    .querySelector(".App-header")
                    .classList.remove("blue");
                }}
                aria-label="Terminate speaking"
              >
                <img
                  src={HandIcon}
                  alt="Terminate Icon"
                  className="terminate-icon"
                />
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
