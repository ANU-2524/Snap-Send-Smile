require('dotenv').config(); // load .env variables

const nodemailer = require("nodemailer");

async function testEmail() {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    let info = await transporter.sendMail({
      from: `"Test Sender" <${process.env.EMAIL_USER}>`,
      to: "anusoni25.2006@gmail.com", // Replace with your email to receive test email
      subject: "Test Email ✔",
      text: "This is a test email from Nodemailer.",
    });
    console.log("Test email sent:", info.response);
  } catch (error) {
    console.error("Test email error:", error);
  }
}

testEmail();
