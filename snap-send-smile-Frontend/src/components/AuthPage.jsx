import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import "../Style/AuthPage.css";

const provider = new GoogleAuthProvider();

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleGoogleLogin = async () => {
    try {
     await signInWithPopup(auth, provider);
      navigate(from);
    } catch (err) {
      alert(`Google sign-in failed: ${err.code}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
      navigate(from);
    } catch (err) {
      alert(`Auth failed: ${err.code}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login to SnapSendSmile" : "Sign Up for SnapSendSmile"}</h2>

        <input
          className="auth-input"
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button 
          className="auth-submit" 
          type="submit" 
          disabled={loading || !email || !password}
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>

        <p className="toggle-auth">
          {isLogin ? "Don't have an account?" : "Already registered?"}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? " Sign Up" : " Login"}
          </span>
        </p>
      </form>

      <div className="divider">
        <div className="divider-text">or</div>
      </div>

      <div className="google-auth-container">
        <button className="google-btn" onClick={handleGoogleLogin}>
          <FcGoogle className="google-icon" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};
export default AuthPage;
