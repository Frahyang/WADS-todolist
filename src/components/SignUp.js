import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendEmailVerification, 
  updateProfile 
} from "firebase/auth";
import { auth, provider, db } from "../firebase"; 
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import "./SignUp-Login.css";

const SignUp = ({ onGoogleSignIn }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); 
  const [loading, setLoading] = useState(false); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        username: formData.username,
        profilePicture: null,
      });

      await updateProfile(user, { displayName: formData.username });

      setMessage("Verification email sent! Please check your inbox.");
      console.log("User created:", user);

      setFormData({
        username: "",
        email: "",
        password: "",
      });

      navigate("/login"); 
    } catch (error) {
      setError(error.message);
      console.error("Sign-Up Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      console.log("User signed in with Google:", user);

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          username: user.displayName,
          profilePicture: user.photoURL || null,
        });
      }
  
      onGoogleSignIn();
      navigate("/todolist"); 
    } catch (error) {
      setError("Google Sign-In Error: " + error.message);
      console.error("Google Sign-In Error:", error.message);
    }
  };
  
  return (
    <div className="login">
      <div>
        <h1>Sign Up</h1>
        <form onSubmit={handleSignUp}>
          <input 
            className="user-details" 
            type="text" 
            name="username" 
            placeholder="Enter Username" 
            value={formData.username} 
            onChange={handleChange} 
            required 
          />
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
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
        {message && <div style={{ color: "green", marginTop: "10px" }}>{message}</div>}

        <p>Already have an account? <Link to="/login" className="redirect-page">Login</Link></p>
        <p> -- Or continue with -- </p>
        
        <button onClick={handleGoogleLogin} className="google-login-button">
          Google
        </button>
      </div>
    </div>
  );
};

export default SignUp;
