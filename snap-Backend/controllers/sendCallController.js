const nodemailer = require('nodemailer');

exports.sendCallInvite = async (req, res) => {
  const { email, roomId } = req.body;

  if (!email || !roomId) {
    return res.status(400).json({ success: false, message: "Missing email or roomId" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const joinLink = `https://snap-send-smile.vercel.app/call/${roomId}`;

    const mailOptions = {
      from: `"SnapSendSmile 📸" <${process.env.EMAIL}>`,
      to: email,
      subject: `📞 Incoming SnapSendSmile Video Call`,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>You’ve Got a Call! 📞</h2>
          <p>Your friend is inviting you to a video call on SnapSendSmile.</p>
          <a href="${joinLink}" style="display: inline-block; margin: 20px auto; padding: 10px 20px; background-color: #ff7f50; color: white; text-decoration: none; border-radius: 6px;">
            Join Call Now
          </a>
          <p>This link will take you to the video call room.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Call invite sent!" });
  } catch (err) {
    console.error("❌ Error sending call invite:", err);
    res.status(500).json({ success: false, message: "Error sending invite." });
  }
};
