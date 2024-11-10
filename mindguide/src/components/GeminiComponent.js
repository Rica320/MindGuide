import React, { useState, useEffect } from "react";
import GenerativeAiClient from "./GenerativeAiClient";

const GeminiComponent = ({ prompt, onResponse }) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResponse = async () => {
      const client = new GenerativeAiClient();
      try {
        const apiResponse = await client.generateContent(prompt);
        setResponse(apiResponse);
        onResponse(apiResponse);
      } catch (error) {
        console.error("Error fetching response:", error);
        setError("Error fetching response");
        onResponse("Error fetching response");
      }
    };

    fetchResponse();
  }, [prompt, onResponse]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!response) {
    return <div>Loading...</div>;
  }

  let contentText =
    response.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

  if (typeof contentText === "string") {
    contentText = contentText
      .replace(/\*\*(.*?)\*\*/g, "\n$1\n")
      .replace(/\*(.*?)\*/g, "\n$1\n");
    console.log(JSON.stringify(contentText));
    return <div className="gemini-response">{contentText}</div>;
  } else {
    return <div>Invalid response</div>;
  }
};

export default GeminiComponent;
