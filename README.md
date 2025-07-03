# 📸 SnapSendSmile 💌

> **Capture Moments. Add Magic. Send Smiles.**  
SnapSendSmile is a fun, filter-rich, and user-friendly web app that lets you **capture selfies**, **apply cool filters**, **create GIFs**, and **instantly email** them to your friends or loved ones. Whether it's a moment of joy, a funny face, or a cute gesture — Snap, Smile, Send!

---

## 🌐 Live Demo

👉 Try it now: [https://snap-send-smile.vercel.app/](https://snap-send-smile.vercel.app/)  
*(Works best on Chrome & Firefox with webcam access enabled)*

---

## 🛠️ Tech Stack

### Frontend
- **React.js** – Component-based UI
- **CSS3** – Custom styling and animations
- **gif.js.optimized** – GIF generation from live webcam
- **Vite** – Lightning-fast React bundler

### Backend
- **Node.js** + **Express.js** – Email handling and API
- **Nodemailer** – Send emails with snaps as attachments
- **Render** – Backend deployment

### Auth
- **Firebase Authentication** – Email/password & Google Sign-In

---

## 📸 Core Features

- 🎥 **Live Webcam Preview** (front/back camera toggle)
- 🎨 **10+ Fun Filters** (grayscale, retro, comic, soft pink, etc.)
- 🖼️ **Capture & Save Snaps**
- 🎞️ **Record GIFs** (2s duration with effects)
- 📨 **Send Snaps via Email** (with custom message)
- 👨‍💻 **Firebase Auth** (Login, Sign Up, Google Sign-In)
- 📜 **Snap History** with download & delete options
- 💾 **Auto Snap Naming** using localStorage counter

---

## 📂 Project Structure

SnapSendSmile/
├── public/
│ └── gif.worker.js
├── src/
│ ├── components/
│ │ ├── Camera.jsx
│ │ └── AuthPage.jsx
│ ├── context/
│ │ └── AuthContext.jsx
│ ├── Style/
│ │ ├── Camera.css
│ │ └── AuthPage.css
│ ├── firebase.js
│ ├── App.jsx
│ └── main.jsx


---

## 🧑‍💻 How to Run Locally

### Prerequisites
- Node.js ≥ 16
- Firebase project with Auth enabled
- Gmail or SMTP credentials for Nodemailer

### Steps

1. **Clone the repo**
```bash
git clone https://github.com/yourusername/SnapSendSmile.git
cd SnapSendSmile
npm install

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...

EMAIL_USER=your@email.com
EMAIL_PASS=yourpassword

npm run dev
cd backend
npm install
node index.js

Made with ❤️ by ANU_SONI
If you liked this project, don't forget to ⭐ it and share your smile 😄