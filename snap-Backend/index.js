const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: ['https://snap-send-smile.vercel.app'],
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '20mb' }));

app.post('/api/send-snap', async (req, res) => {
  const { emails, message, attachments } = req.body;

  if (!emails || !attachments || attachments.length === 0) {
    return res.status(400).json({ success: false, msg: 'Missing fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

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
    console.error('Email sending error:', err);
    res.status(500).json({ success: false, msg: 'Server error while sending email.' });
  }
});

const PORT = 5566;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
