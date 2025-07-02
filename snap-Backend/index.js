const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.post('/api/send-snap', async (req, res) => {
  const { emails, image, message } = req.body;

  // Validate input
  if (!emails || !Array.isArray(emails) || emails.length === 0 || !image) {
    return res.status(400).json({ success: false, msg: 'Missing fields or invalid data' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // Send email to each recipient
    for (const email of emails) {
      await transporter.sendMail({
        from: `"SnapSendSmile 📸" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Here’s your Snap!',
        html: `<p>${message || 'Enjoy your photo!'}</p>`,
        attachments: [
          {
            filename: 'snap.png',
            content: image.split("base64,")[1],
            encoding: 'base64',
          },
        ],
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
