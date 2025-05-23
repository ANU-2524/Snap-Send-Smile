const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const photoRoutes = require('./routes/photoRoutes');
const authMiddleware = require("./middleware/authMiddleware"); 

app.use('/api/auth', authRoutes); 
app.use("/api/photos", authMiddleware, photoRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(process.env.PORT, () => console.log("Server running"));
    })
    .catch(err => console.log(err));

app.get("/", (req, res) => res.send("SnapSendSmile Backend"));

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});
