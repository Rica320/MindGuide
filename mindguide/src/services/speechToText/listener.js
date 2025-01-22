import log from "../../utils/logger";

const sdk = require("microsoft-cognitiveservices-speech-sdk");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { usePolly, speakText } = require("../textToSpeech/pollySpeak");
const { getModeratorResponse } = require("../LLM/llm_model");
let speaking = false;

// timers to monitor the silence and session's duration
let silenceTimer;

// Get environment variables for Speech API key and region
const speechKey = process.env.REACT_APP_MICROSOFT_SPEECH_KEY;
const serviceRegion = process.env.REACT_APP_MICROSOFT_SPEECH_REGION;
const language = "en-US";

let transcribingStop = false;
let conversationTranscriber;

if (!speechKey || !serviceRegion) {
  console.error(
    "Please set the SPEECH_KEY and SPEECH_REGION environment variables."
  );
  process.exit(1);
}

export async function listener(
  modelType,
  numberParticipants,
  names,
  setActiveSpeaker,
  setLlmResponse
) {
  log.info("Starting listener");
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    speechKey,
    serviceRegion
  );
  speechConfig.speechRecognitionLanguage = language;
  speechConfig.setProperty(
    sdk.PropertyId.SpeechServiceResponse_DiarizeIntermediateResults,
    "true"
  );

  const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
  conversationTranscriber = new sdk.ConversationTranscriber(
    speechConfig,
    audioConfig
  );

  // Callback Functions
  const onRecognitionCanceled = (_, evt) => console.log("Canceled event");
  const onSessionStopped = (_, evt) => console.log("SessionStopped event");
  const onSessionStarted = (_, evt) => {
    console.log("SessionStarted event");
  };

  const onTranscribed = (s, evt) => {
    if (
      // As moderator speaks always as a first speaker, he is Guest-1
      //evt.result.speakerId === "Guest-1" ||
      evt.result.speakerId === "Unknown"
    ) {
      console.log(
        "\nDisable transcribing as Moderator is speaking:" +
          evt.result.speakerId
      );
      return;
    }
    console.log("\nTRANSCRIBED:");
    if (evt.result.reason === sdk.ResultReason.RecognizedSpeech) {
      console.log(`\tText=${evt.result.text}`);
      console.log(`\tSpeaker ID=${evt.result.speakerId}`);
      console.log(`\tModel type=${modelType}`);

      // remove all the non-alphanumeric characters and if empty string, return
      let message = evt.result.text.replace(/[^a-zA-Z0-9 ]/g, "");
      if (!message || message === "Play") {
        // weird bug where it transcribes "Play" by hearing nothing
        return;
      }

      // speak
      speak(
        evt.result.speakerId,
        evt.result.text,
        modelType,
        numberParticipants,
        names,
        setLlmResponse
      );
    } else if (evt.result.reason === sdk.ResultReason.NoMatch) {
      console.log(
        `\tNOMATCH: Speech could not be TRANSCRIBED: ${evt.result.noMatchDetails}`
      );
    }
  };

  const onTranscribing = (s, evt) => {
    // resets the silence timer if the function is called
    clearTimeout(silenceTimer);
    //Set a new  timer
    silenceTimer = setTimeout(() => {
      silenceDetected();
    }, 15000); // 15 second
    console.log("Reset timer on transcribing");
    console.log("\nTRANSCRIBING:");
    console.log(`\tText=${evt.result.text}`);
    console.log(`\tSpeaker ID=${evt.result.speakerId}`);

    // if the moderator is speaking the transcription is disabled
    if (
      //evt.result.speakerId === "Guest-1" ||
      evt.result.speakerId === "Unknown"
    ) {
      console.log("\nTRANSCRIBE DISABLED...Moderator speaking:");
      return;
    }

    setActiveSpeaker((prevActiveSpeakers) => {
      // Add the speaker if it's not already in the list
      if (
        !prevActiveSpeakers.includes({
          id: evt.result.speakerId,
          speaking: true,
        })
      ) {
        // set all speaking to false
        prevActiveSpeakers.forEach((speaker) => {
          speaker.speaking = false;
        });

        // check if any with same id if so set speaking to true
        if (
          prevActiveSpeakers.some(
            (speaker) => speaker.id === evt.result.speakerId
          )
        ) {
          return prevActiveSpeakers.map((speaker) => {
            if (speaker.id === evt.result.speakerId) {
              speaker.speaking = true;
            }
            return speaker;
          });
        }

        let indexOfSpeaker = evt.result.speakerId.split("-")[1];

        return [
          ...prevActiveSpeakers,
          {
            id: evt.result.speakerId,
            name:
              parseInt(indexOfSpeaker) === 1
                ? "Agent Emily"
                : names[parseInt(indexOfSpeaker) - 2],
            speaking: true,
          },
        ];
      }
      return prevActiveSpeakers; // Otherwise, do nothing
    });
  };

  const stopCallback = (s, evt) => {
    console.log(`CLOSING on ${evt}`);
    clearTimeout(silenceTimer);
    console.log("Stopping timer");
    transcribingStop = true;
    speak(
      "",
      "The users stopped the session. Thank the participants and say goodbye. Set intervene to True."
    );
  };

  // Connect callbacks to conversation transcriber events
  conversationTranscriber.canceled = onRecognitionCanceled;
  conversationTranscriber.sessionStarted = onSessionStarted;
  conversationTranscriber.transcribed = onTranscribed;
  conversationTranscriber.transcribing = onTranscribing;

  // Stop transcribing on session stopped or canceled events
  conversationTranscriber.sessionStopped = stopCallback;
  conversationTranscriber.canceled = stopCallback;

  try {
    // Start transcribing asynchronously
    await conversationTranscriber.startTranscribingAsync();

    // Waits for completion
    while (!transcribingStop) {
      await sleep(500);
    }

    // Stop transcribing
    await conversationTranscriber.stopTranscribingAsync();
  } catch (error) {
    console.error(`Encountered exception: ${error}`);
  }
}

function silenceDetected() {
  console.log("Silence detected! No activity for 10 seconds.");
  if (!transcribingStop) {
    speak(
      "",
      "No one has spoken for 15 seconds, intervene to reactivate the conversation."
    );
  }
}

function speak(
  speakerId,
  text,
  modelType,
  numberParticipants,
  names,
  setLlmResponse
) {
  if (!speaking) {
    // speak
    speaking = true;
    clearTimeout(silenceTimer);
    console.log("Stopping timer for speaking");
    const indexOfSpeaker =
      speakerId && speakerId.includes("-") ? speakerId.split("-")[1] : null;
    let speakerName;
    if (indexOfSpeaker) {
      speakerName =
        parseInt(indexOfSpeaker) === 1
          ? "Agent Emily"
          : names[parseInt(indexOfSpeaker) - 2];
    } else {
      speakerName = "Unknown";
    }
    const newPrompt = speakerId ? `${speakerName}: ${text}` : `(${text})`;
    let forceIntervene = false; // forceIntervene is used when we want to Emily to speak, idea is putting counter and detect too much silemce, them force it to be true
    getModeratorResponse(
      newPrompt,
      modelType,
      numberParticipants,
      names,
      forceIntervene
    ).then((response) => {
      setLlmResponse(response);
      if (!usePolly) {
        // with the browser TTS
        const utterance = new SpeechSynthesisUtterance(response);
        document.querySelector(".App-header").classList.add("blue");
        utterance.onend = () => {
          speaking = false;
          document.querySelector(".App-header").classList.remove("blue");
          clearTimeout(silenceTimer);
          silenceTimer = setTimeout(() => {
            silenceDetected();
          }, 15000); // 15 second
          console.log("Starting timer for speaking");
        };
        window.speechSynthesis.speak(utterance);
      } else {
        // with polly
        document.querySelector(".App-header").classList.add("blue");
        speakText(response).then(() => {
          speaking = false;
          document.querySelector(".App-header").classList.remove("blue");
          clearTimeout(silenceTimer);
          silenceTimer = setTimeout(() => {
            silenceDetected();
          }, 15000); // 15 second
          console.log("Starting timer for speaking");
        });
      }
    });
  }
}

export function endSession() {
  clearTimeout(silenceTimer);
  console.log("Stopping timer");
}

export async function stopListener() {
  console.log("The session is stopping...");
  transcribingStop = true;
  clearTimeout(silenceTimer);
  // speakText("Thank you for participating in the session. Goodbye!").then(() => {
  //   console.log("Session ended");
  // }
  // );
  console.log("Stopping timer");
  if (!conversationTranscriber) {
    return;
  }

  await conversationTranscriber.stopTranscribingAsync();
}
