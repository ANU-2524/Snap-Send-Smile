import { useRef, useState } from "react";
import API from "../api";

export default function CameraCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState("");

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const takePhoto = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, 300, 200);
  };

  const uploadPhoto = async () => {
    const dataURL = canvasRef.current.toDataURL("image/jpeg");
    const blob = await (await fetch(dataURL)).blob();
    const formData = new FormData();
    formData.append("photo", blob, "snap.jpg");
    formData.append("message", message);

    await API.post("/photos/upload", formData);
    alert("Uploaded and emailed!");
  };

  return (
    <div>
      <video ref={videoRef} autoPlay width="300" height="200" />
      <canvas ref={canvasRef} width="300" height="200" style={{ display: "block", marginTop: "10px" }} />
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={takePhoto}>Take Photo</button>
      <input placeholder="Enter a message" onChange={e => setMessage(e.target.value)} />
      <button onClick={uploadPhoto}>Upload & Send</button>
    </div>
  );
}
