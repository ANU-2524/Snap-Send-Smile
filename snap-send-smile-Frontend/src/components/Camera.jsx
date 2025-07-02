import React, { useRef, useState, useEffect } from 'react';

const Camera = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };
    getCamera();
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/png');
    setPhoto(dataURL);
    onCapture(dataURL); // send to parent
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '500px' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <button onClick={capturePhoto}>📸 Take Snap</button>
      {photo && <img src={photo} alt="Captured Snap" style={{ width: '200px', marginTop: '10px' }} />}
    </div>
  );
};

export default Camera;
