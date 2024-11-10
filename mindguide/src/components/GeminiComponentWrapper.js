// src/components/GeminiComponentWrapper.js
import React from "react";
import GeminiComponent from "./GeminiComponent";

const GeminiComponentWrapper = ({ prompt, onResponse }) => {
  return <GeminiComponent prompt={prompt} onResponse={onResponse} />;
};

export default GeminiComponentWrapper;
