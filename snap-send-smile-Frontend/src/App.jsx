import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Camera from './components/Camera';
import AuthPage from './components/AuthPage';
import CallInvite from "./components/CallInvite";
import VideoCall from './components/VideoCall';
import "./App.css";

// Header Component
const Header = ({ user, onLogout }) => (
  <div className="app-header">
    <div className="brand-section">
      <h1 className="app-title">SnapSendSmile</h1>
      <div className="logo-mark">SSS</div>
    </div>
    
    <div className="user-section">
      <div className="user-avatar">
        {user.email.charAt(0).toUpperCase()}
      </div>
      <div className="user-info">
        <div className="user-email">{user.email}</div>
        <div className="user-status">Premium Member</div>
      </div>
      <button className="logout-btn" onClick={onLogout}>
        <span>Logout</span>
        <i className="icon-exit"></i>
      </button>
    </div>
  </div>
);

// Filter Section Component
const FilterSection = ({ selectedFilter, onFilterChange }) => {
  const FILTER_OPTIONS = [
    { value: "none", label: "No Filter" },
    { value: "grayscale", label: "Grayscale" },
    { value: "sepia", label: "Sepia" },
    { value: "brightness", label: "Brightness" },
    { value: "contrast", label: "Contrast" },
    { value: "comic", label: "Comic" },
    { value: "softpink", label: "Soft Pink" },
    { value: "ghost", label: "Ghost" },
    { value: "cool", label: "Cool" },
    { value: "retro", label: "Retro VHS" },
  ];

  return (
    <div className="filter-section">
      <div className="section-header">
        <h3 className="section-title">Camera Filters</h3>
        <div className="filter-preview" style={{ 
          background: 'linear-gradient(45deg, #ff9a9e, #fad0c4)',
          filter: getFilterCSS(selectedFilter)
        }}></div>
      </div>
      
      <div className="filter-grid">
        {FILTER_OPTIONS.map((filter) => (
          <button
            key={filter.value}
            className={`filter-option ${selectedFilter === filter.value ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.value)}
          >
            <div className="filter-thumb" style={{ 
              filter: getFilterCSS(filter.value)
            }}></div>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Email Section Component
const EmailSection = ({ email, message, setEmail, setMessage, onSend, status }) => (
  <div className="email-section">
    <div className="section-header">
      <h3 className="section-title">Send Your Snaps</h3>
      <div className="section-actions">
        <button className="send-btn" onClick={onSend}>
          <i className="icon-send"></i>
          Send Snap
        </button>
      </div>
    </div>
    
    <div className="form-group">
      <label className="form-label">
        <i className="icon-email"></i>
        Recipient Emails
      </label>
      <input
        type="text"
        className="form-input"
        placeholder="friend@example.com, colleague@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="form-note">Separate multiple emails with commas</div>
    </div>

    <div className="form-group">
      <label className="form-label">
        <i className="icon-message"></i>
        Message
      </label>
      <textarea
        className="form-input"
        rows="3"
        placeholder="Add a personal message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
    </div>
    
    {status && (
      <div className={`status-message ${status.includes('✅') ? 'status-success' : status.includes('❌') ? 'status-error' : ''}`}>
        {status}
      </div>
    )}
  </div>
);

// History Section Component
const HistorySection = ({ snapHistory, setSnapHistory }) => {
  const handleDeleteSnap = (index) => {
    const updated = [...snapHistory];
    updated.splice(index, 1);
    setSnapHistory(updated);
  };

  if (snapHistory.length === 0) {
    return (
      <div className="history-section empty-state">
        <div className="empty-icon">
          <i className="icon-camera"></i>
        </div>
        <h4>No Snaps Yet</h4>
        <p>Capture your first snap to get started</p>
      </div>
    );
  }

  return (
    <div className="history-section">
      <div className="section-header">
        <h3 className="section-title">Snap History</h3>
        <div className="section-subtitle">{snapHistory.length} captured</div>
      </div>
      
      <div className="history-grid">
        {snapHistory.map((snap, idx) => {
          const isGIF = typeof snap.url === 'string' && snap.url.startsWith('data:image/gif');
          return (
            <div className="snap-card" key={idx}>
              <div className="card-header">
                <div className="snap-name">{snap.name}</div>
                <div className="snap-meta">
                  {isGIF ? 'GIF' : 'Photo'} • {new Date().toLocaleTimeString()}
                </div>
              </div>
              
              <div className="card-media">
                <img
                  src={snap.url}
                  alt={snap.name}
                  className="snap-image"
                  style={{ filter: getFilterCSS(snap.filter) }}
                />
              </div>
              
              <div className="card-actions">
                <a
                  className="action-btn download-btn"
                  href={snap.url}
                  download={`${snap.name}${isGIF ? '.gif' : '.png'}`}
                >
                  <i className="icon-download"></i>
                  Download
                </a>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteSnap(idx)}
                >
                  <i className="icon-delete"></i>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Video Call Section Component
const VideoCallSection = () => (
  <div className="video-call-section">
    <div className="section-header">
      <h3 className="section-title">Invite Friend to a Video Call</h3>
      <div className="section-subtitle">Premium video experience</div>
    </div>
    <CallInvite />
  </div>
);

// Helper function for filters
const getFilterCSS = (filter) => {
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
};

function Home() {
  const { currentUser, signOutUser } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(
    localStorage.getItem("selectedFilter") || "none"
  );
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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emails: emailList, message, attachments }),
      });

      const data = await res.json();
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

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    localStorage.setItem("selectedFilter", filter);
  };

  if (!currentUser) return <AuthPage />;

  return (
    <div className="app-container">
      <Header user={currentUser} onLogout={handleLogout} />
      
      <div className="content-grid">
        <div className="camera-column">
          <FilterSection 
            selectedFilter={selectedFilter} 
            onFilterChange={handleFilterChange} 
          />
          <Camera 
            onCapture={handleCapture} 
            selectedFilter={selectedFilter} 
          />
        </div>
        
        <div className="content-column">
          <EmailSection
            email={email}
            message={message}
            setEmail={setEmail}
            setMessage={setMessage}
            onSend={handleSend}
            status={status}
          />
          
          <HistorySection 
            snapHistory={snapHistory}
            setSnapHistory={setSnapHistory}
          />
          
          <VideoCallSection />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/call/:roomId" element={<VideoCall />} />
    </Routes>
  );
}

export default App;