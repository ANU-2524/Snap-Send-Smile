const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middleware/authMiddleware");

// Configure multer storage
const storage = multer.memoryStorage(); // or diskStorage
const upload = multer({ storage });

// Protected upload route
router.post("/upload", verifyToken, upload.single("photo"), async (req, res) => {
  try {
    const photoBuffer = req.file.buffer;
    const message = req.body.message;

    // Save the photo and message to DB or email logic here...

    res.status(200).json({ message: "Uploaded successfully", photoUrl: "http://..." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
