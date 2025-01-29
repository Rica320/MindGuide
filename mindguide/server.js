const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const winston = require("winston");
const cors = require("cors");

const app = express();
const port = 3001;

if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
  console.log("Logs directory created");
} else {
  console.log("Logs directory already exists");
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});

// Use CORS middleware to allow requests from the React app
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(bodyParser.json());

app.post("/api/logs", (req, res) => {
  console.log("Received log:", req.body);
  const { level, message } = req.body;
  logger.log({ level, message });
  res.status(200).send("Log written successfully");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
