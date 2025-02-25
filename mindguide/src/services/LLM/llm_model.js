import log from "../../utils/logger";

const { OpenAI } = require("openai");

const client = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_KEY,
  dangerouslyAllowBrowser: true,
});

let conversationHistory = [];

const role_temperatures = {
  moderator: 0.2,
  empathic: 0.3,
  peer: 0.5,
};

// Function to get response with initial instruction only once
export async function getOpenAIResponse(
  newPrompt,
  modelType,
  participantsNumber,
  names,
  forceIntervene = false
) {
  let role_behaviors = {
    moderator:
      "As a highly intelligent AI system, for the rest of the conversation you are Emily, the moderator in a group therapy session with " +
      participantsNumber +
      " other participants ( " +
      names +
      " ).\nYour only tasks are:\n- Make sure that all participants interact with each other as a group.\n- Make sure the conversation goes on properly.\n\nYour responses must be very short and foster group dynamics and help all participants to have the opportunity to express their thoughts.\nYou must not give your personal opinions or suggestions to participants.\nMake sure everyone introduces themselves by their name at first.\nIntervene only if you feel it is strictly necessary.",
    empathic:
      "As a highly intelligent AI system, for the rest of the conversation you are Emily, an empathic listener who listens to the problems of " +
      participantsNumber +
      " other participants ( " +
      names +
      " ) in the conversation.\nYour tasks are:\n- Allow participants to talk as much as possible to vent.\n- Make sure everyone is talking.\n- Help participants interact with each other.\n\nYou must interact with an understanding, calm and empathetic attitude, making participants feel heard, understood and in a safe environment.\nYou must keep your answers very brief and must not give suggestions or personal opinions.\nMake sure everyone introduces themselves by their name at first.\nDo not interrupt the participants if they are speaking.",
    peer:
      "As a highly intelligent AI system, for the rest of the conversation you are Emily, a participant within a conversation with your " +
      participantsNumber +
      " friends ( " +
      names +
      " ) who are discussing their problems.\nYour only tasks are:\n-Make sure everyone has a chance to talk and interact with each other\n- Make sure the conversation goes on properly.\n\nYou have to interact as one of their peers, so be friendly and inclined to help them.\nMake sure everyone introduces themselves by their name at first.",
  };

  modelType = modelType || "moderator";
  const systemPrompt = {
    role: "system",
    content:
      role_behaviors[modelType] +
      'YOU MUST SET "intervene" to false EXCEPT ONLY ON THESE SITUATIONS:\n' +
      "- When you are starting the session.\n" +
      "- If someone is using inappropriate language and insulting\n" +
      "-  If a participant is not allowing others to speak or a participant has been inactive for a while.\n" +
      "-  If the discussion is going in circles and no progress is being made.\n\n" +
      'Always respond in JSON format. When you don\'t want to intervene send the following: {"response":"","intervene":false}. ' +
      "Please keep in mind that sending intervene as false can be done only 3 consecutive times as maximun." +
      "Take a big breath and think before you intervene. Remember that the goal is to help the participants to express themselves and interact with each other." +
      'Otherwise when you need to talk put your dialog in the "response" field and set "intervene" to true. When the conversation is ending, ' +
      "say goodbye and thank the participants. Start the session after receiving this message. Don't mention your role to the participants.",
  };

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

  console.log("LLM response:", result.choices[0].message.content);
  let response = "";
  try {
    response = JSON.parse(result.choices[0].message.content); // Get the response from the result
  } catch (error) {
    const cleanedResponse = result.choices[0].message.content.replace(
      "response:",
      ""
    );
    response = { response: cleanedResponse, intervene: true };
    console.log("Error: ", error);
  }

  if (!response.response) {
    response.response = "";
  }

  conversationHistory.push({
    role: "assistant",
    content: JSON.stringify(response),
  }); // Add the response to the history

  // if (conversationHistory.length > 10) {
  //   conversationHistory.shift(); // Remove the oldest moderator response
  //   conversationHistory.shift(); // Remove the oldest user message
  // }

  if (response.intervene || forceIntervene) {
    return response.response;
  }

  return "";
}

export async function getModeratorResponse(
  speechText,
  modelType,
  numberParticipants,
  names,
  forceIntervene = false
) {
  const response = await getOpenAIResponse(
    speechText,
    modelType,
    numberParticipants,
    names,
    forceIntervene
  );
  log.info("Moderator: ", response);

  return response;
}
