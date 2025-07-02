const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.post('/api/send-snap', async (req, res) => {
  const { email, image, message } = req.body;

  if (!email || !image) return res.status(400).json({ success: false, msg: 'Missing fields' });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // works with free Gmail
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: `"SnapSendSmile 📸" <${process.env.EMAIL}>`,
      to: email,
      subject: 'Here’s your Snap!',
      text: message || 'Enjoy your photo!',
      attachments: [
        {
          filename: 'snap.png',
          content: image.split("base64,")[1],
          encoding: 'base64',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error('Email sending error:', err);
    res.status(500).json({ success: false });
  }
});

const PORT = 5566;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
