import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import '../Style/VideoCall.css';

const socket = io("https://snap-send-smile-w2ts.onrender.com");

const VideoCall = () => {
  const { roomId } = useParams();
  const userVideo = useRef();
  const partnerVideo = useRef();
  const streamRef = useRef();
  const peerRef = useRef(null);
  const navigate = useNavigate();

  const [waiting, setWaiting] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    // Step 1: Get local stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      streamRef.current = stream;
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }

      // Step 2: Join room
      socket.emit("join-room", roomId);

      // Step 3: Handle existing peer in room
      socket.on("other-user", userId => {
        const peer = createPeer(userId, socket.id, stream);
        peerRef.current = peer;
        setWaiting(false);
      });

      // Step 4: New user joined
      socket.on("user-joined", userId => {
        const peer = addPeer(userId, stream);
        peerRef.current = peer;
        setWaiting(false);
      });

      // Step 5: Handle signal
      socket.on("signal", ({ signal, callerId }) => {
        if (peerRef.current) {
          peerRef.current.signal(signal);
        }
      });
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

    peer.on("stream", partnerStream => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = partnerStream;
      }
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

    peer.on("stream", partnerStream => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = partnerStream;
      }
    });

    return peer;
  };

  const toggleMic = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  const toggleCam = () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamOn(videoTrack.enabled);
    }
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
        <video className="video" ref={userVideo} autoPlay muted playsInline />
        <video className="video" ref={partnerVideo} autoPlay playsInline />
      </div>
      <p className="status-message">
        {waiting ? "Waiting for your friend to join..." : "You're connected! 🎉"}
      </p>
      <div className="controls">
        <button onClick={toggleMic}>
          {micOn ? "Mute Mic 🎙️" : "Unmute Mic 🔇" }
        </button>
        <button onClick={toggleCam}>
          {camOn ? "Turn Off Camera 📷❌" : "Turn On Camera 📷✅"}
        </button>
        <button onClick={endCall} className="end-call">End Call ❌</button>
      </div>
    </div>
  );
};

export default VideoCall;
