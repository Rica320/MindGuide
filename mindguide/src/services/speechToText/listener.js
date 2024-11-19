// TODO: REFACTOR THIS SPAGHETTI CODE
import log from "../../utils/logger";

const sdk = require("microsoft-cognitiveservices-speech-sdk");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { speakText } = require("../textToSpeech/pollySpeak");
const { getModeratorResponse } = require("../LLM/llm_model");

// Get environment variables for Speech API key and region
const speechKey = process.env.REACT_APP_SPEECH_KEY;
const serviceRegion = process.env.REACT_APP_SPEECH_REGION;
const language = "en-US";

let transcribingStop = false;
let conversationTranscriber;

if (!speechKey || !serviceRegion) {
  console.error(
    "Please set the SPEECH_KEY and SPEECH_REGION environment variables."
  );
  process.exit(1);
}

const synth = window.speechSynthesis; // ONLY FOR TESTING IN BROWSER

export async function listener() {
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
  const onSessionStarted = (_, evt) => console.log("SessionStarted event");

  const onTranscribed = (s, evt) => {
    if (
      // As modelator speaks always as a first speaker, he is Guest-1
      evt.result.speakerId === "Guest-1" ||
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

      // remove all the non-alphanumeric characters and if empty string, return
      let message = evt.result.text.replace(/[^a-zA-Z0-9 ]/g, "");
      if (!message || message === "Play") {
        // weird bug where it transcribes "Play" by hearing nothing
        return;
      }

      // speak
      console.log("Moderator will respond");
      getModeratorResponse(evt.result.speakerId, evt.result.text).then(
        // log.info(evt.result.speakerId + ": " + evt.result.text),
        (response) => {
          console.log("Moderator Response: ", response);
          // whith the browser TTS
          //synth.speak(new SpeechSynthesisUtterance(response));
          // with polly
          speakText(response);
        }
      );

    } else if (evt.result.reason === sdk.ResultReason.NoMatch) {
      console.log(
        `\tNOMATCH: Speech could not be TRANSCRIBED: ${evt.result.noMatchDetails}`
      );
    }
  };

  const onTranscribing = (s, evt) => {
    if (
      evt.result.speakerId === "Guest-1" ||
      evt.result.speakerId === "Unknown"
    ) {
      console.log("\nTRANSCRIBE DISABLED...Moderator speaking:");
      return;
    }
    console.log("TRANSCRIBING:");
    console.log(`\tText=${evt.result.text}`);
    console.log(`\tSpeaker ID=${evt.result.speakerId}`);
  };

  const stopCallback = (s, evt) => {
    console.log(`CLOSING on ${evt}`);
    transcribingStop = true;
  };

  // Connect callbacks to conversation transcriber events
  conversationTranscriber.canceled = onRecognitionCanceled;
  conversationTranscriber.sessionStopped = onSessionStopped;
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

export async function stopListener() {
  transcribingStop = true;

  if (!conversationTranscriber) {
    return;
  }

  await conversationTranscriber.stopTranscribingAsync();
}
