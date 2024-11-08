const { AzureOpenAI } = require("openai");

const client = new AzureOpenAI({
    apiKey: process.env.REACT_APP_OPENAI_KEY,
    endpoint: process.env.REACT_APP_OPENAI_ENDPOINT_,
    deployment: process.env.REACT_APP_AZURE_OPENAI_MODEL,
    apiVersion: process.env.REACT_APP_AZURE_OPENAI_APIVERSION,
    dangerouslyAllowBrowser: true,
});

let conversationHistory = [];
let isFirstPrompt = true;  // Flag to indicate if it's the first prompt
const initialInstruction = "For the rest of the conversation, you are the moderator (M) in a group therapy session with three other participants (A, B and C). Your responses must be empathic and insightful to the problems of the participants. YOU MUST BE SILENT EXCEPT ONLY ON THESE SITUATIONS:\n"
    + "- When you are starting the session or the session is within 15 minutes to the end.\n"
    + "- If a participant is not allowing others to speak or using inappropriate language or a participant has been inactive for a while.\n"
    + "- If the discussion is going in circles and no progress is being made.\n"
    + "- When you feel the need to introduce a new topic in the conversation.\n"
    + "Always respond in JSON format. When you don't want to intervene send the following: {\"response\":\"\",\"intervene\":false}. Otherwise when you need to talk put your dialog in the \"response\" field and set \"intervene\" to true. When the conversation is ending, say goodbye and thank the participants and add a flag \"end\" set to true. Start the session after receiving this message.";



// Function to get response with initial instruction only once
async function getOpenAIResponse(newPrompt) {

    const systemPrompt = {
        role: 'system',
        content: "For the rest of the conversation, you are the moderator (M) in a group therapy session with three other participants (A, B and C). Your responses must be empathic and insightful to the problems of the participants. YOU MUST BE SILENT EXCEPT ONLY ON THESE SITUATIONS:\n- When you are starting the session or the session is within 15 minutes to the end.\n- If a participant is not allowing others to speak or using inappropriate language or a participant has been inactive for a while.\n- If the discussion is going in circles and no progress is being made.\n- When you feel the need to introduce a new topic in the conversation.\n\nAlways respond in JSON format. When you don't want to intervene send the following: {\"response\":\"\",\"intervene\":false}. Otherwise when you need to talk put your dialog in the \"response\" field and set \"intervene\" to true. When the conversation is ending, say goodbye and thank the participants and add a flag \"end\" set to true. Start the session after receiving this message."
    };


    const result = await client.chat.completions.create({
        messages: [{ role: 'user', content: newPrompt }],
        model: 'gpt-35-turbo-16k',
    });

    const response = result.choices[0].message.content;  // Get the response from the result
    conversationHistory.push(`M: ${response}`);  // Add the response to the history
    return response;
}


async function getModeratorResponse(speechText) {
    console.log("Moderator Responding");
    const response = await getOpenAIResponse(speechText);
    console.log("Moderator Response: ", response);

    return response;
}

module.exports = { getModeratorResponse };
