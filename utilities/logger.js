const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../auth.log');

function logEvent(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFile(logFile, logMessage, (err) => {
        if (err) console.error("Failed to write to log file:", err);
    });
}

module.exports = logEvent;
