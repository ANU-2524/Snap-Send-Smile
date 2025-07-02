import React, { useRef, useState, useEffect } from 'react';
import GIF from 'gif.js.optimized';
import workerURL from '/gif.worker.js?url'; // Vite-specific import for public worker
import "../Style/Camera.css"

const Camera = ({ onCapture, selectedFilter }) => {
  const [gifURL, setGifURL] = useState(null);
  const [isGifGenerating, setIsGifGenerating] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [stream, setStream] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedVideoURL, setRecordedVideoURL] = useState(null);
  const [videoChunks, setVideoChunks] = useState([]);

  // Load available camera devices
  const loadDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (!selectedDeviceId && videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error listing devices:', err);
    }
  };

  // Record GIF
  const recordGIF = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      console.warn("Video not ready.");
      return;
    }

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

    const totalFrames = 20;
    const interval = 100;

    for (let i = 0; i < totalFrames; i++) {
      ctx.filter = getFilterCSS(selectedFilter);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      gif.addFrame(ctx, { copy: true, delay: interval });
      await new Promise(res => setTimeout(res, interval));
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

        const gifSnap = {
          name: snapName,
          url: `data:image/gif;base64,${base64data}`,
          filter: selectedFilter,
        };

        onCapture(gifSnap);
      };
      reader.readAsDataURL(blob);
    });

    gif.render();
  };

const startCamera = async (deviceId) => {
  if (stream) stream.getTracks().forEach(track => track.stop());

  try {
    const constraints = deviceId
      ? { video: { deviceId: { exact: deviceId } }, audio: true }
      : { video: { facingMode: { exact: "environment" } }, audio: true }; // rear camera

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

    videoRef.current.srcObject = mediaStream;
    setStream(mediaStream);
  } catch (err) {
    console.error('Error starting camera:', err);
    alert("Failed to access the camera. Please check permissions and HTTPS.");
  }
};

  useEffect(() => {
    loadDevices();
    navigator.mediaDevices.addEventListener("devicechange", loadDevices);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", loadDevices);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
   startCamera(selectedDeviceId); 
  }, [selectedDeviceId]);

  const handleDeviceChange = (e) => {
    setSelectedDeviceId(e.target.value);
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

    const snapObj = {
      name: snapName,
      url: dataURL,
      filter: selectedFilter,
    };

    onCapture(snapObj);
  };

  const startRecording = () => {
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

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
    <div className="camera-container">
    <div>
      <div>
        <label>📸 Select Camera: </label>
        <select value={selectedDeviceId || ''} onChange={handleDeviceChange}>
          {devices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId.slice(-4)}`}
            </option>
          ))}
        </select>
      </div>

      <button onClick={recordGIF} style={{ cursor: 'pointer' }}  disabled={isGifGenerating}>
        🎞️ Record 2s GIF
      </button>
      {isGifGenerating && <p>⏳ Generating GIF...</p>}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          maxWidth: '500px',
          filter: getFilterCSS(selectedFilter),
          marginTop: '10px',
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      <div style={{ marginTop: '10px' }}>
        <button  style={{ cursor: 'pointer' }}  onClick={startCountdown} disabled={countdown !== null}>
          ⏱️ Snap in 3s
        </button>
        &nbsp;
        {recording ? (
          <button onClick={stopRecording} style={{ color: 'red' }} >
            ⏹️ Stop Recording
          </button>
        ) : (
          <button style={{ cursor: 'pointer' }}  onClick={startRecording}>
            🎬 Start Recording
          </button>
        )}
        {countdown && <p>⏳ Snapping in {countdown}...</p>}
      </div>

      {recordedVideoURL && (
        <div style={{ marginTop: '20px' }}>
          <h4>🎥 Recorded Video:</h4>
          <video
            src={recordedVideoURL}
            controls
            style={{ width: '100%', maxWidth: '500px' }}
          />
          <a href={recordedVideoURL} download="recorded-video.webm">
            📥 Download Video
          </a>
        </div>
      )}
    </div>
    </div>
  );
};

export default Camera;
