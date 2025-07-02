import React, { useRef, useState, useEffect } from 'react';

const Camera = ({ onCapture, selectedFilter }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };
    getCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCountdown = () => {
    if (countdown !== null) return; // avoid multiple triggers

    let seconds = 3;
    setCountdown(seconds);

    const timer = setInterval(() => {
      seconds -= 1;
      if (seconds === 0) {
        clearInterval(timer);
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(seconds);
      }
    }, 1000);
  };

const capturePhoto = () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  const context = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  context.filter = getFilterCSS(selectedFilter);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataURL = canvas.toDataURL('image/png');

  let snapCounter = Number(localStorage.getItem('snapCounter')) || 1;
  const snapName = `Snap_${String(snapCounter).padStart(2, '0')}`;
  localStorage.setItem('snapCounter', snapCounter + 1);

  const snapObj = {
    name: snapName,
    url: dataURL,
    filter: selectedFilter,
  };

  onCapture(snapObj);
};


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

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          maxWidth: '500px',
          filter: getFilterCSS(selectedFilter),
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <br />
      <button onClick={startCountdown} disabled={countdown !== null}>
        ⏱️ Snap in 3s
      </button>
      {countdown && <p>⏳ Snapping in {countdown}...</p>}
    </div>
  );
};

export default Camera;
