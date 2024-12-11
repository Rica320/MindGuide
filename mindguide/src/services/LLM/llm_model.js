import log from "../../utils/logger";

const { AzureOpenAI } = require("openai");

const client = new AzureOpenAI({
  apiKey: process.env.REACT_APP_OPENAI_KEY,
  endpoint: process.env.REACT_APP_OPENAI_ENDPOINT_,
  deployment: process.env.REACT_APP_AZURE_OPENAI_MODEL,
  apiVersion: process.env.REACT_APP_AZURE_OPENAI_APIVERSION,
  dangerouslyAllowBrowser: true,
});

let conversationHistory = [];
let sessionStarted = false;
let timeStarted = null;

let map_type = {
  moderator:
    "Your responses must be short and foster group dynamics and help all participants to have the opportunity to express their thoughts.",
  empathic:
    "Your responses must be empathic and insightful to the problems of the participants.",
  peer: "Respond as if you were an equal to the other participants by helping them with their problems as a friend.",
  default: "",
};

// Function to get response with initial instruction only once
export async function getOpenAIResponse(speakerId, newPrompt, modelType) {
  modelType = modelType || "default";
  const systemPrompt = {
    role: "system",
    content:
      // "As a highly intelligent AI system, you are the moderator (M) in a conversation between three participants (A, B and C), about a group therapy session. Your job is to guide the conversation, without being too intrusive. A good moderator is one that does intervene, but only at the right time and not too often. A good moderator is one who shows empathy, caring, and dives deep into the problems of the participants. Some guidelines for intervention are:\n1. If one or more participants are dominating the conversation and not allowing others to speak.\n2. If a participant is being disrespectful or using inappropriate language.\n3. If the session is near the end (15 minutes).\n4. If the discussion is going in circles and no progress is being made.\n5. If you feel the need to introduce a new topic in the conversation.\n6. If one or more of the participants are not participating in the conversation.\n7. If you are starting the conversation.\n\nPlease always respond via a JSON file that contains a flag INTERVENE and a TEXT field. In case you, as the moderator, have to intervene within the chat conversation, set the INTERVENE flag to true and add your answer in the TEXT field. Make sure both fields are always distinct and INTERVENE is only true or false. If as a moderator you don’t intervene, set INTERVENE to false and place in TEXT your reasoning. If the conversation is ending, say goodbye and thanks to the participants and add a Flag END set to true. Start the session after receiving this message."
      "For the rest of the conversation, you are Emily, the moderator in a group therapy session with three other participants (Ricardo, Lorenzo and Kiam). Ensure that all participants interact with each other as a group. Make sure everyone introduces themselves by their name at first. " +
      map_type[modelType] +
      ' YOU MUST SET "intervene" to false EXCEPT ONLY ON THESE SITUATIONS:\n- When you are starting the session or the session is within 15 minutes to the end.\n- If a participant is not allowing others to speak or using inappropriate language or a participant has been inactive for a while.\n- If the discussion is going in circles and no progress is being made.\n\nAlways respond in JSON format. When you don\'t want to intervene send the following: {"response":"","intervene":false}. Otherwise when you need to talk put your dialog in the "response" field and set "intervene" to true. When the conversation is ending, say goodbye and thank the participants. Start the session after receiving this message. ',
  };
  //console.log("map: ", JSON.stringify(map_type));
  //console.log("modelType: ", modelType);
  //console.log("System Prompt: ", JSON.stringify(systemPrompt));
  const result = await client.chat.completions.create({
    messages: [
      systemPrompt,
      ...conversationHistory,
      { role: "user", content: speakerId + " " + newPrompt },
    ],
    temperature: 0.5,
    max_tokens: 150,
    top_p: 0.95,
    model: "gpt-35-turbo-16k",
  });

  if (sessionStarted) {
    if (timeStarted === null) timeStarted = new Date().getTime();
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - timeStarted;
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    let timeStamp = `[${minutes}:${seconds}] `;
    conversationHistory.push({
      role: "user",
      content: timeStamp + speakerId + ": " + newPrompt,
    }); // Add the user prompt to the history ... change user id to the speaker id
  } else {
    sessionStarted = true;
  }

  let response = "";
  try {
    response = JSON.parse(result.choices[0].message.content); // Get the response from the result
    console.log("Response: ", response);
  } catch (error) {
    response = { response: result.choices[0].message.content, intervene: true };
    console.log("Error: ", error);
  }
  console.log("Response: ", JSON.stringify(response));

  if (!response.response) {
    response.response = ""
  }

  conversationHistory.push({
    role: "assistant",
    content: JSON.stringify(response),
  }); // Add the response to the history

  if (conversationHistory.length > 10) {
    conversationHistory.shift(); // Remove the oldest moderator response
    conversationHistory.shift(); // Remove the oldest user message
  }

  if (response.intervene) {
    return response.response;
  }

  return "";
}

export async function getModeratorResponse(speakerId, speechText, modelType) {
  console.log("Moderator Responding");
  log.info(speakerId + ": " + speechText);
  const response = await getOpenAIResponse(speakerId, speechText, modelType);
  log.info("Moderator: ", response);
  console.log("Moderator Response: ", response);

  return response;
}
