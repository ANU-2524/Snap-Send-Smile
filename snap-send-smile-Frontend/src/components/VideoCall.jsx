import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import '../Style/VideoCall.css';

const socket = io("https://snap-send-smile-w2ts.onrender.com"); // ⛔ Use deployed URL later

const VideoCall = () => {
  const { roomId } = useParams();
  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const streamRef = useRef();

  useEffect(() => {
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

  return (
    <div className="video-call-room">
      <h2>SnapSendSmile Call Room 📹</h2>
      <div className="video-wrapper">
        <video className="video" ref={userVideo} autoPlay muted />
        <video className="video" ref={partnerVideo} autoPlay />
      </div>
    </div>
  );
};

export default VideoCall;
