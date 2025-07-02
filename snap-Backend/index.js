const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: [
    'https://snap-send-smile.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));   
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '20mb' }));

// ✅ Health check
app.get('/', (req, res) => {
  res.send('SnapSendSmile Backend is Running ✅');
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

    for (const email of emails) {
      await transporter.sendMail({
        from: `"SnapSendSmile 📸" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Here’s your Snap!',
        html: `<p>${message || 'Enjoy your photo!'}</p>`,
        attachments: attachments.map((snap, i) => {
          const ext = snap.filename?.endsWith('.gif') ? '.gif' : '.png';
          return {
            filename: snap.filename || `snap_${i + 1}${ext}`,
            content: snap.content,
            encoding: 'base64',
            contentType: ext === '.gif' ? 'image/gif' : 'image/png'
          };
        })
      });
    }

    res.json({ success: true, sentTo: emails.length });
  } catch (err) {
    console.error('❌ Email send error:', err.message);
    res.status(500).json({ success: false, msg: 'Server error while sending email.' });
  }
});

const PORT = process.env.PORT || 5566;
app.listen(PORT, () => {
  console.log(`🚀 SnapSendSmile Server running on http://localhost:${PORT}`);
});
