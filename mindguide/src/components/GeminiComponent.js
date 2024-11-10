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

  //const contentText = response.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

  const contentText =
    response &&
    response.candidates &&
    Array.isArray(response.candidates) &&
    response.candidates[0] &&
    response.candidates[0].content &&
    Array.isArray(response.candidates[0].content.parts) &&
    response.candidates[0].content.parts[0] &&
    response.candidates[0].content.parts[0].text
      ? response.candidates[0].content.parts[0].text
      : "No response";

  console.log(JSON.stringify(contentText));

  return (
    <div>
      {typeof contentText === "string"
        ? contentText
        : "Invalid response format"}
    </div>
  );
};

export default GeminiComponent;
