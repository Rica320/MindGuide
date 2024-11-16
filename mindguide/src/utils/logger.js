import log from "loglevel";

log.setLevel(log.levels.DEBUG);

const sendLogToServer = (level, message) => {
  fetch("http://localhost:3001/api/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ level, message }),
  }).catch((error) => {
    console.error("Failed to send log to server:", error);
  });
};

// Extend loglevel to send logs to the server
const originalFactory = log.methodFactory;
log.methodFactory = (methodName, logLevel, loggerName) => {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  return (...messages) => {
    rawMethod(...messages);
    sendLogToServer(methodName, messages.join(" "));
  };
};

log.setLevel(log.getLevel());

export default log;
