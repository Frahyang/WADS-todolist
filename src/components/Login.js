import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, sendEmailVerification, signInWithPopup } from "firebase/auth";
import "./SignUp-Login.css";
import { auth, provider } from "../firebase";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (user.emailVerified) {
        console.log("User logged in:", user);
        onLogin();
        navigate("/todolist");
      } else {
        setUnverifiedEmail(user);
        setError("Email is not verified. Please verify your email before logging in.");
      }
    } catch (error) {
      setError(error.message);
      console.error("Login Error:", error.message);
    }
  };

  const handleResendVerification = async () => {
    if (unverifiedEmail) {
      try {
        await sendEmailVerification(unverifiedEmail);
        alert("Verification link sent! Please check your email.");
      } catch (error) {
        console.error("Error sending verification email:", error.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User signed in with Google:", result.user);
      onLogin();
      navigate("/todolist");
    } catch (error) {
      setError("Google Sign-In Error: " + error.message);
      console.error("Google Sign-In Error:", error.message);
    }
  };

  return (
    <div className="login">
      <div>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input
            className="user-details"
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className="user-details"
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="login-button">Login</button>
        </form>

        {error && <div className="error-message">{error}</div>}
        {unverifiedEmail && (
          <div className="error-message">
            <span>Email not verified. </span>
            <button onClick={handleResendVerification} className="resend-link">Resend Link</button>
          </div>
        )}

        <p>Don't have an account? <Link to="/signup" className="redirect-page">Sign Up</Link></p>
        <p> -- Or continue with -- </p>
        
        <button onClick={handleGoogleLogin} className="google-login-button">
          Google
        </button>
      </div>
    </div>
  );
};

export default Login;
