import { useState, useRef, useEffect } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  // Start the camera when component mounts
  useEffect(() => {
    if (videoRef.current && token) startCamera();
  }, [token]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Failed to access camera");
      console.error(err);
    }
  };

  const capturePhoto = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 320, 240);
    const dataURL = canvasRef.current.toDataURL("image/jpeg");
    setPhoto(dataURL);
  };

  const uploadPhoto = async () => {
    if (!photo) return alert("No photo to upload");

    const blob = await (await fetch(photo)).blob();
    const formData = new FormData();
    formData.append("photo", blob, "snapshot.jpg");
    formData.append("message", message);

    try {
      const res = await fetch("http://localhost:5000/api/photos/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Photo uploaded & emailed!");
        console.log("Photo URL:", data.photoUrl);
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err) {
      alert("Error uploading photo");
      console.error(err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/signup";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        alert("Authenticated successfully!");
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      alert("Network error");
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPhoto(null);
    setMessage("");
  };

  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          /><br />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><br />
          <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📸 SnapSendSmile</h1>
      <button onClick={logout} style={{ float: "right" }}>Logout</button>
      <br />
      <video ref={videoRef} width="320" height="240" autoPlay />
      <br />
      <button onClick={capturePhoto}>Capture Photo</button>
      <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }} />

      {photo && (
        <>
          <img src={photo} alt="Captured" style={{ marginTop: 10, border: "1px solid #ccc" }} />
          <div>
            <textarea
              rows="3"
              placeholder="Write a message to be emailed with your photo"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <br />
            <button onClick={uploadPhoto}>Upload + Email</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
