require('dotenv').config();

const { app } = require('./index');
const { db } = require('./db');   
const logEvent = require('./utilities/logger');

const PORT = process.env.PORT || 5000;

app.use((err, req, res, next) => {
    console.error(err.stack);
    logEvent(`SERVER ERROR | ${err.message} | IP: ${req.ip}`);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    logEvent(`SERVER START | Listening on port ${PORT}`);
});
