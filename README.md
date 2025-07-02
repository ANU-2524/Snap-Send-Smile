SnapSendSmile – Full Features Plan
✅ Phase 1: Core MVP
🎯 Goal: Basic working version with photo capture and email sending.

 Access device camera (HTML5 getUserMedia)

 Capture image using a “Snap” button (Canvas API)

 Show a preview of the captured image

 Ask user to enter:

 Email

 ✅ Custom Message

 Send the photo + message to email via backend (Node.js + Nodemailer)

 Show success message or error

🎨 Phase 2: UI Fun + Photo Effects
🎯 Goal: Make it more interactive and aesthetic

 📸 Photo Filters before sending:

 Grayscale

 Sepia

 Blur

 Contrast/brightness

 👇 UI filter picker before sending the snap

 Canvas updates dynamically with selected filter

💾 Phase 3: Photo History (Local)
🎯 Goal: Keep track of user snaps in the browser

 Save photos temporarily (LocalStorage / IndexedDB)

 Show them in a gallery view

 Option to:

 Download

 Delete

 Resend to someone

🔗 Phase 4: QR Code Sharing
🎯 Goal: Share snaps easily with anyone

 Generate a public URL to access the snap (requires backend storage or third-party image hosting)

 Create a QR Code of that URL

 Display/share QR with the user

🌞 Phase 5: Snap of the Day
🎯 Goal: Add positivity or humor

 On each snap, show a random:

✅ Motivational quote

✅ Joke / Fun fact

 Fetch from a free API like ZenQuotes or use a local list

👥 Phase 6: Multi-email Support
🎯 Goal: Allow sending snaps to multiple people

 User enters multiple emails (comma-separated)

 Validate all emails

 Send to all via backend in a loop

 Show confirmation with success/failure for each

