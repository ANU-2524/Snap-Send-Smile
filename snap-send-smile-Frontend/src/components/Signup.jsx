import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMsg("✅ Signup successful");
    } catch (error) {
      setMsg("❌ " + error.message);
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} /><br />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} /><br />
      <button onClick={handleSignup}>Signup</button>
      <p>{msg}</p>
    </div>
  );
};

export default Signup;
