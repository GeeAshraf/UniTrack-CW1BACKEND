const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { UpdateRequestById } = require('./controllers/requestController');
const protect = require('./middleware/projectRoute');
const restrictTo = require('./middleware/restrictTo');

dotenv.config();


const allowedOrigins = [
  "http://localhost:5500",
  "http://localhost:5501",
  "http://localhost:5502",
  "http://127.0.0.1:5500",
  "http://127.0.0.1:5501",
  "http://127.0.0.1:5502",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

app.use(cors({
  origin: function(origin, callback){
    if (!origin) return callback(null, true); 
    if (allowedOrigins.includes(origin) || (origin && (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")))) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));


app.use(cookieParser());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true, message: 'UniTrack-BACKEND running' }));


app.put('/requests/:id', protect, restrictTo('admin', 'technician'), UpdateRequestById);
app.patch('/requests/:id', protect, restrictTo('admin', 'technician'), UpdateRequestById);

app.put('/api/requests/:id', protect, restrictTo('admin', 'technician'), UpdateRequestById);
app.patch('/api/requests/:id', protect, restrictTo('admin', 'technician'), UpdateRequestById);

const RequestRouter = require('./routes/requestRoutes');
const UserRouter = require('./routes/userRoutes');
const AuthRouter = require('./routes/authRoutes');

app.use('/requests', RequestRouter);
app.use('/users', UserRouter);
app.use('/auth', AuthRouter);

const frontendPath = path.join(__dirname, '..', 'UniTrack-CW1FRONT');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'login.html'));
});

module.exports = { app };
