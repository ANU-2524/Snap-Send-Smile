const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const sendCallInviteRoute = require("./routes/send-call-invite");
const socketHandler = require('./utils/socketHandler'); // ✅ <-- Import your socket logic

const app = express();
const server = http.createServer(app); // ✅ Create HTTP server for both Express + Socket.IO

// ✅ Create and configure Socket.IO server
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://snap-send-smile.vercel.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ✅ Initialize socket events
io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);
  socketHandler(socket, io); // ✅ PASS socket + io (not wrapping connection again)
});

app.use(cors({
  origin: [
    'https://snap-send-smile.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));

// ✅ Routes
app.use('/api', sendCallInviteRoute);

app.get('/', (req, res) => {
  res.send('SnapSendSmile Backend is Running!');
});

app.post('/api/send-snap', async (req, res) => {
  const { emails, message, attachments } = req.body;

  if (!emails || !attachments || attachments.length === 0) {
    return res.status(400).json({ success: false, msg: 'Missing required fields.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    console.log("Request Received:", emails);

    for (const email of emails) {
      await transporter.sendMail({
        from: `"SnapSendSmile 📸" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Here’s your Snap!',
        html: `<p>${message || 'Enjoy your photo!'}</p>`,
        attachments: attachments.map((snap, index) => ({
          filename: snap.filename || `snap_${index + 1}.png`,
          content: snap.content,
          encoding: 'base64',
          contentType: 'image/png'
        }))
      });
    }

    res.json({ success: true, sentTo: emails.length });
  } catch (err) {
    console.error('❌ Email send error:', err.message);
    res.status(500).json({ success: false, msg: 'Server error while sending email.' });
  }
});

const PORT = process.env.PORT || 5566;
server.listen(PORT, () => {
  console.log(`🚀 SnapSendSmile Server running on http://localhost:${PORT}`);
});
