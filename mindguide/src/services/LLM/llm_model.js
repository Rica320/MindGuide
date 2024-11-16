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

// Function to get response with initial instruction only once
export async function getOpenAIResponse(speakerId, newPrompt) {
  const systemPrompt = {
    role: "system",
    content:
      'For the rest of the conversation, you are the moderator (M) in a group therapy session with three other participants (A, B and C). Your responses must be empathic and insightful to the problems of the participants. YOU MUST BE SILENT EXCEPT ONLY ON THESE SITUATIONS:\n- When you are starting the session or the session is within 15 minutes to the end.\n- If a participant is not allowing others to speak or using inappropriate language or a participant has been inactive for a while.\n- If the discussion is going in circles and no progress is being made.\n- When you feel the need to introduce a new topic in the conversation.\n\nAlways respond in JSON format. When you don\'t want to intervene send the following: {"response":"","intervene":false}. Otherwise when you need to talk put your dialog in the "response" field and set "intervene" to true. When the conversation is ending, say goodbye and thank the participants and add a flag "end" set to true. Start the session after receiving this message.',
  };

  const result = await client.chat.completions.create({
    messages: [
      systemPrompt,
      ...conversationHistory,
      { role: "user", content: speakerId + " " + newPrompt },
    ],
    temperature: 0.7,
    max_tokens: 300,
    top_p: 0.95,
    model: "gpt-35-turbo-16k",
  });

  if (sessionStarted) {
    conversationHistory.push({
      role: "user",
      content: speakerId + ": " + newPrompt,
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

  conversationHistory.push({ role: "assistant", content: response.response }); // Add the response to the history

  if (conversationHistory.length > 10) {
    conversationHistory.shift(); // Remove the oldest moderator response
    conversationHistory.shift(); // Remove the oldest user message
  }

  if (response.intervene) {
    return response.response;
  }

  return "";
}

export async function getModeratorResponse(speakerId, speechText) {
  console.log("Moderator Responding");
  log.info(speakerId + ": " + speechText);
  const response = await getOpenAIResponse(speakerId, speechText);
  log.info("Moderator: ", response);
  console.log("Moderator Response: ", response);

  return response;
}
