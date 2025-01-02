import log from "../../utils/logger";

const { OpenAI } = require("openai");

const client = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_KEY,
  dangerouslyAllowBrowser: true,
});

let conversationHistory = [];

const role_behaviors = {
  moderator:
    "Your responses must be short and don't express any opinions or suggestion.",
  empathic:
    "Your responses must be empathic and minimal.",
  peer:
    "Involve others in the conversation actively and make suggestions as a friend.",
};

const role_temperatures = {
  moderator: 0.2,
  empathic: 0.3,
  peer: 0.5,
};

// Function to get response with initial instruction only once
export async function getOpenAIResponse(newPrompt, modelType, numberParticipants) {
  modelType = modelType || "moderator";
  const systemPrompt = {
    role: "system",
    content:
      "For the rest of the conversation, you are Emily, the moderator in a group therapy session with " +numberParticipants+ " other participants. Ensure that all participants interact with each other as a group. " +
      'Always respond in JSON format. When you want to be silent send the following: {"response":"","intervene":false}. Otherwise when you need to talk put your dialog in the "response" field and set "intervene" to true. ' +
      role_behaviors[modelType] +
      'YOU MUST INTERVENE ONLY ON THESE SITUATIONS: 1: When you are starting the session or the session is within 15 minutes to the end. 2: If a participant is not allowing others to speak or using inappropriate language or a participant has been inactive for a while. 3: If the discussion is going in circles and no progress is being made.',
  };
  
  console.log("LLM request:", systemPrompt)
  const result = await client.chat.completions.create({
    messages: [
      systemPrompt,
      ...conversationHistory,
      { role: "user", content: newPrompt },
    ],
    temperature: role_temperatures[modelType],
    max_completion_tokens: 150,
    model: process.env.REACT_APP_OPENAI_MODEL,
  });

  conversationHistory.push({
    role: "user",
    content: newPrompt,
  });

  console.log("LLM response:", result.choices[0].message.content)
  let response = "";
  try {
    response = JSON.parse(result.choices[0].message.content); // Get the response from the result
  } catch (error) {
    const cleanedResponse = result.choices[0].message.content.replace("response:", "");
    response = { response: cleanedResponse, intervene: true };
    console.log("Error: ", error);
  }

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

export async function getModeratorResponse(speechText, modelType, numberParticipants) {
  console.log("Moderator Responding");
  const response = await getOpenAIResponse(speechText, modelType, numberParticipants);
  log.info("Moderator: ", response);

  return response;
}
