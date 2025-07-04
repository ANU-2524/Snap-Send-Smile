import React, { useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import '../Style/CallInvite.css'; 

const CallInvite = () => {
  const [friendEmail, setFriendEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendInvite = async () => {
    if (!friendEmail) return setMessage("Please enter a valid email.");
    setSending(true);
    setMessage("");

    const roomId = uuidv4(); // generates unique room like xyz-123-abcd

    try {
      const res = await axios.post('https://snap-send-smile-w2ts.onrender.com/api/send-call-invite', {
        email: friendEmail,
        roomId,
      });

      if (res.data.success) {
        setMessage("Invitation sent successfully! ✅");
      } else {
        setMessage("Failed to send invitation. ❌");
      }
    } catch (err) {
      setMessage("Error sending invite.");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="call-invite-container">
      <h2>📞 Invite Friend to a Video Call</h2>
      <input
        type="email"
        placeholder="Enter friend's email"
        value={friendEmail}
        onChange={(e) => setFriendEmail(e.target.value)}
      />
      <button onClick={handleSendInvite} disabled={sending}>
        {sending ? "Sending..." : "Send Call Invite"}
      </button>
      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default CallInvite;
