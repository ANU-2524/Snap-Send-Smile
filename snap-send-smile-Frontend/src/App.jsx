import React, { useState } from 'react';
import Camera from './components/Camera';
import AuthPage from './components/AuthPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { currentUser, signOutUser } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(localStorage.getItem("selectedFilter") || "none");
  const [snapHistory, setSnapHistory] = useState([]);

  const handleCapture = (snapObj) => {
    if (!snapObj?.url || typeof snapObj.url !== 'string') return;

    let snapCounter = parseInt(localStorage.getItem('snapCounter') || '0', 10);
    snapCounter += 1;
    localStorage.setItem('snapCounter', snapCounter);

    const name = `Snap_${String(snapCounter).padStart(2, '0')}`;
    snapObj.name = name;

    setSnapHistory(prev => [snapObj, ...prev]);
  };

  const handleSend = async () => {
    if (!email || snapHistory.length === 0) return alert('Please enter emails and take at least one snap!');

    const emailList = email
      .split(',')
      .map(e => e.trim())
      .filter(e => /\S+@\S+\.\S+/.test(e));

    if (emailList.length === 0) return alert("Enter at least one valid email!");

    try {
      setStatus('Sending...');

      const attachments = snapHistory.map((snap) => {
        if (typeof snap.url !== 'string' || !snap.url.includes('base64,')) return null;
        const base64Part = snap.url.split('base64,')[1];
        return {
          filename: `${snap.name}${snap.url.startsWith('data:image/gif') ? '.gif' : '.png'}`,
          content: base64Part,
          encoding: 'base64',
        };
      }).filter(Boolean);

      const res = await fetch('https://snap-send-smile-w2ts.onrender.com/api/send-snap', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ emails: emailList, message, attachments }),
      });
console.log("📤 Response status:", res.status);
      const data = await res.json();
console.log("📤 Response data:", data);
      setStatus(data.success ? '✅ All snaps sent!' : '❌ Failed to send.');
    } catch (err) {
      console.error(err);
      setStatus('❌ Server error.');
    }
  };

  const handleLogout = () => {
    signOutUser();
    localStorage.removeItem('snapCounter');
    localStorage.removeItem('selectedFilter');
    setSnapHistory([]);
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>📷 SnapSendSmile</h1>
      {!currentUser ? (
        <AuthPage />
      ) : (
        <>
          <p>Welcome, {currentUser.email}</p>
          <button onClick={handleLogout}>🚪 Logout</button>

          <br /><br />
          <label>🎨 Choose a Filter: </label>
          <select
            value={selectedFilter}
            onChange={(e) => {
              setSelectedFilter(e.target.value);
              localStorage.setItem("selectedFilter", e.target.value);
            }}
          >
            <option value="none">🎯 No Filter</option>
            <option value="grayscale">🖤 Grayscale</option>
            <option value="sepia">📜 Sepia</option>
            <option value="brightness">☀️ Brightness</option>
            <option value="contrast">🔆 Contrast</option>
            <option value="comic">🐶 Comic</option>
            <option value="softpink">🦄 Soft Pink</option>
            <option value="ghost">👻 Ghost</option>
            <option value="cool">🕶️ Cool</option>
            <option value="retro">🎥 Retro VHS</option>
          </select>

          <Camera onCapture={handleCapture} selectedFilter={selectedFilter} />

          <div style={{ marginTop: '20px' }}>
            <input
              type="text"
              placeholder="Enter recipient emails (comma-separated)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
            <small>Example: friend1@gmail.com, friend2@yahoo.com</small>

            <br /><br />

            <textarea
              rows="4"
              placeholder="Enter a message to send with the snap..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />

            <br /><br />
            <button  style={{cursor:'pointer'}}   onClick={handleSend}>📤 Send to Email</button>
            <p>{status}</p>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3>📜 Snap History</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              {snapHistory.map((snap, idx) => {
                const isGIF = typeof snap.url === 'string' && snap.url.startsWith('data:image/gif');
                return (
                  <div key={idx} style={{ border: '1px solid #ccc', padding: '10px' }}>
                    <strong>{snap.name}</strong>
                    <br />
                    {typeof snap.url === 'string' ? (
                      <img
                        src={snap.url}
                        alt={snap.name}
                        width="150"
                        style={{ filter: getFilterCSS(snap.filter) }}
                      />
                    ) : (
                      <p>❌ Invalid Snap Format</p>
                    )}
                    <br />
                    <a
                      href={snap.url}
                      download={`${snap.name}${isGIF ? '.gif' : '.png'}`}
                      style={{ marginRight: '10px' }}
                    >
                      📥 Download
                    </a>
                    <button onClick={() => {
                      const updated = [...snapHistory];
                      updated.splice(idx, 1);
                      setSnapHistory(updated);
                    }}>❌ Delete</button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getFilterCSS(filter) {
  switch (filter) {
    case 'grayscale': return 'grayscale(100%)';
    case 'sepia': return 'sepia(100%)';
    case 'brightness': return 'brightness(150%)';
    case 'contrast': return 'contrast(150%)';
    case 'comic': return 'contrast(200%) blur(1px)';
    case 'softpink': return 'sepia(30%) brightness(120%) hue-rotate(330deg)';
    case 'ghost': return 'invert(100%) brightness(150%)';
    case 'cool': return 'hue-rotate(180deg) contrast(120%)';
    case 'retro': return 'sepia(60%) contrast(140%)';
    default: return 'none';
  }
}

export default App;
