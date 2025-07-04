// ✅ CAMERA.JSX FIXED (FRONTEND)
import React, { useRef, useState, useEffect } from 'react';
import GIF from 'gif.js.optimized';
import workerURL from '/gif.worker.js?url';
import "../Style/Camera.css";

const Camera = ({ onCapture, selectedFilter }) => {
  const [gifURL, setGifURL] = useState(null);
  const [isGifGenerating, setIsGifGenerating] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedVideoURL, setRecordedVideoURL] = useState(null);
  const [videoChunks, setVideoChunks] = useState([]);
  const [facingMode, setFacingMode] = useState('environment');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const startCamera = async (facing = 'environment') => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    const constraints = {
      video: { facingMode: { ideal: facing } }, 
      audio: true,
    };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera access failed:", err);
      alert("Camera access failed. Please allow permissions or refresh browser.");
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [facingMode]);

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

  const startCountdown = () => {
    if (countdown !== null) return;
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
    if (!video || !canvas) return;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.filter = getFilterCSS(selectedFilter);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    let snapCounter = Number(localStorage.getItem('snapCounter')) || 1;
    const snapName = `Snap_${String(snapCounter).padStart(2, '0')}`;
    localStorage.setItem('snapCounter', snapCounter + 1);
    onCapture({ name: snapName, url: dataURL, filter: selectedFilter });
  };

  const recordGIF = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;
    setIsGifGenerating(true);
    setGifURL(null);
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: video.videoWidth,
      height: video.videoHeight,
      workerScript: workerURL,
    });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    for (let i = 0; i < 20; i++) {
      ctx.filter = getFilterCSS(selectedFilter);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      gif.addFrame(ctx, { copy: true, delay: 100 });
      await new Promise((res) => setTimeout(res, 100));
    }
    gif.on('finished', (blob) => {
      const url = URL.createObjectURL(blob);
      setGifURL(url);
      setIsGifGenerating(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        let snapCounter = Number(localStorage.getItem('snapCounter')) || 1;
        const snapName = `GIF_${String(snapCounter).padStart(2, '0')}`;
        localStorage.setItem('snapCounter', snapCounter + 1);
        onCapture({ name: snapName, url: `data:image/gif;base64,${base64data}`, filter: selectedFilter });
      };
      reader.readAsDataURL(blob);
    });
    gif.render();
  };

  const startRecording = () => {
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(blob);
      setRecordedVideoURL(videoURL);
      setVideoChunks(chunks);
    };
    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  return (
    <div className="camera-container">
      <div className="camera-controls">
        <label>📱 Choose Camera: </label>
        <select 
          className="camera-select"
          value={facingMode} 
          onChange={(e) => setFacingMode(e.target.value)}
        >
          <option value="user">Front (Selfie)</option>
          <option value="environment">Back</option>
        </select>

        <button 
          className="camera-btn"
          onClick={recordGIF} 
          disabled={isGifGenerating}
        >
          🎞️ Record 2s GIF
        </button>
      </div>

      {isGifGenerating && (
        <p className="status-indicator">⏳ Generating GIF...</p>
      )}

      <div className="camera-view">
        {countdown && (
          <div className="countdown-display">{countdown}</div>
        )}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ 
            width: '100%', 
            filter: getFilterCSS(selectedFilter) 
          }} 
        />
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      <div className="camera-controls" style={{ marginTop: '25px' }}>
        <button 
          className="camera-btn"
          onClick={startCountdown} 
          disabled={countdown !== null}
        >
          ⏱️ Snap in 3s
        </button>
        
        {recording ? (
          <button 
            className="camera-btn"
            onClick={stopRecording}
            style={{ background: 'rgba(255, 0, 0, 0.1)', color: 'red' }}
          >
            <span className="recording-indicator"></span>⏹️ Stop Recording
          </button>
        ) : (
          <button 
            className="camera-btn"
            onClick={startRecording}
          >
            🎬 Start Recording
          </button>
        )}
      </div>

      {recordedVideoURL && (
        <div className="recorded-video-container">
          <h4>🎥 Recorded Video:</h4>
          <video 
            className="recorded-video"
            src={recordedVideoURL} 
            controls 
          />
          <a 
            className="download-link"
            href={recordedVideoURL} 
            download="recorded-video.webm"
          >
            📥 Download Video
          </a>
        </div>
      )}
    </div>
  );
};

export default Camera;
