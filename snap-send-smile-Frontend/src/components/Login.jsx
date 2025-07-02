import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import { FaGoogle } from "react-icons/fa"; 
import "../Style/login.css"; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMsg("✅ Logged in!");
    } catch (error) {
      setMsg("❌ " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google login error:", error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <input
        placeholder="Email"
        type="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin} className="login-btn">Login</button>

      <button onClick={handleGoogleLogin} className="google-btn">
        <FaGoogle size={20} style={{ marginRight: "8px" }} />
        Sign in with Google
      </button>

      <p>{msg}</p>
    </div>
  );
};

export default Login;
