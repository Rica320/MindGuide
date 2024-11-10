import axios from "axios";

class GenerativeAiClient {
  constructor(apiKey = process.env.REACT_APP_GOOGLE_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    this.headers = { "Content-Type": "application/json" };
  }

  async generateContent(prompt) {
    const endpoint = `${this.baseUrl}/models/gemini-1.0-pro:generateContent?key=${this.apiKey}`;
    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(endpoint, body, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      console.error(
        "API request failed:",
        error.response ? error.response.data : error.message
      );
      return null;
    }
  }
}

export default GenerativeAiClient;
