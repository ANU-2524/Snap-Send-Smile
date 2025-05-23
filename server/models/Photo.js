const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    imageUrl: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Photo", photoSchema);
