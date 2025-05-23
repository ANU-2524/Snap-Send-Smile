const cloudinary = require("cloudinary").v2;
const nodemailer = require("nodemailer");

// CONFIGURE CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadPhoto = async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;

    // We need to wrap the upload_stream in a Promise to use async/await properly
    const uploadFromBuffer = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
    };

    const result = await uploadFromBuffer(fileBuffer);

    // EMAIL LOGIC
    const userEmail = req.user.email;
    const photoUrl = result.secure_url;
    const message = req.body.message || "You captured this photo!";

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("Sending email to:", userEmail);
    console.log("Photo URL:", photoUrl);

   try {
  await transporter.sendMail({
    from: `"SnapSendSmile" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "📸 Here's your Snap!",
    html: `<p>${message}</p><img src="${photoUrl}" alt="Your Photo" />`,
  });
  console.log("Email sent successfully");
} catch (emailError) {
  console.error("Error sending email:", emailError);
  return res.status(500).json({ error: "Email sending failed." });
}


    return res.status(200).json({ message: "Uploaded & emailed!", photoUrl });
  } catch (err) {
    console.error("Upload photo error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};
