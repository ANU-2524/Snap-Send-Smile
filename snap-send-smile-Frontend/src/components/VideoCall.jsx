import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import '../Style/VideoCall.css';

const socket = io("https://snap-send-smile-w2ts.onrender.com");

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const streamRef = useRef();

  const [statusMessage, setStatusMessage] = useState("Waiting for your friend to join...");
  const [callStarted, setCallStarted] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  useEffect(() => {
    let timeout;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      userVideo.current.srcObject = stream;
      streamRef.current = stream;

      socket.emit("join-room", roomId);

      socket.on("other-user", (userId) => {
        const peer = createPeer(userId, socket.id, stream);
        peerRef.current = peer;
      });

      socket.on("user-joined", (userId) => {
        const peer = addPeer(userId, stream);
        peerRef.current = peer;
      });

      socket.on("signal", (payload) => {
        peerRef.current.signal(payload.signal);
        setStatusMessage(""); // Friend joined
        setCallStarted(true);
        clearTimeout(timeout);
      });

      timeout = setTimeout(() => {
        if (!callStarted) {
          setStatusMessage("👻 Your friend didn’t join within 4 minutes.");
        }
      }, 4 * 60 * 1000); // 4 minutes
    });

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      socket.disconnect();
    };
  }, [roomId]);

  const createPeer = (userToSignal, callerId, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });

    peer.on("signal", signal => {
      socket.emit("sending-signal", { userToSignal, callerId, signal });
    });

    peer.on("stream", stream => {
      partnerVideo.current.srcObject = stream;
    });

    return peer;
  };

  const addPeer = (incomingId, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream
    });

    peer.on("signal", signal => {
      socket.emit("returning-signal", { signal, to: incomingId });
    });

    peer.on("stream", stream => {
      partnerVideo.current.srcObject = stream;
    });

    return peer;
  };

  const toggleMic = () => {
    const audioTrack = streamRef.current.getAudioTracks()[0];
    audioTrack.enabled = !micOn;
    setMicOn(!micOn);
  };

  const toggleCamera = () => {
    const videoTrack = streamRef.current.getVideoTracks()[0];
    videoTrack.enabled = !cameraOn;
    setCameraOn(!cameraOn);
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    socket.disconnect();
    navigate('/');
  };

  return (
    <div className="video-call-room">
      <h2>SnapSendSmile Call Room 📹</h2>
      <div className="video-wrapper">
        <video className="video" ref={userVideo} autoPlay muted />
        <video className="video" ref={partnerVideo} autoPlay />
      </div>

      {statusMessage && <p className="status-text">{statusMessage}</p>}

      <div className="controls">
        <button onClick={toggleMic}>
          {micOn ? "Mute Mic 🔇" : "Unmute Mic 🎤"}
        </button>
        <button onClick={toggleCamera}>
          {cameraOn ? "Turn Off Camera 📷❌" : "Turn On Camera 📷✅"}
        </button>
        <button onClick={endCall} className="end-call">
          End Call ❌
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
