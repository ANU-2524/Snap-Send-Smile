import React, { useState } from 'react';
import Camera from './components/Camera';
import AuthPage from './components/AuthPage'; // ✅ your new login/signup
import { useAuth } from './context/AuthContext';

function App() {
  const { currentUser, signOutUser } = useAuth();

  const [capturedImage, setCapturedImage] = useState(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleCapture = (imageData) => {
    setCapturedImage(imageData);
  };

  const handleSend = async () => {
    if (!email || !capturedImage) return alert('Please enter email and take a snap!');

    try {
      setStatus('Sending...');
      const res = await fetch('http://localhost:5566/api/send-snap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, image: capturedImage, message }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('✅ Sent successfully!');
      } else {
        setStatus('❌ Failed to send.');
      }
    } catch (err) {
      setStatus('❌ Server error.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>📷 SnapSendSmile</h1>

      {!currentUser ? (
        <AuthPage /> // ✅ use new unified auth page
      ) : (
        <>
          <p>Welcome, {currentUser.email}</p>
          <button onClick={signOutUser}>🚪 Logout</button>

          <Camera onCapture={handleCapture} />

          <div style={{ marginTop: '20px' }}>
            <input
              type="email"
              placeholder="Enter recipient's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <br /><br />
            <textarea
              rows="4"
              cols="40"
              placeholder="Enter a message to send with the snap..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <br /><br />
            <button onClick={handleSend}>📤 Send to Email</button>
            <p>{status}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
