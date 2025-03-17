import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import defaultProfilePic from '../assets/defaultProfilePic.jpg';

import './NavBar.css';

export default function NavBar({ onAddTask, onRemoveTask, onLogout, onSearch, onFilterChange}) {
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(defaultProfilePic);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [username, setUsername] = useState(""); 
  const [showPopup, setShowPopup] = useState(false); 
  const [newUsername, setNewUsername] = useState("");
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilter, setCurrentFilter] = useState("All");

  useEffect(() => {
    const loadUserData = async () => {
      if (auth.currentUser) {
        const providerId = auth.currentUser.providerData[0].providerId;

        if (providerId === 'google.com') {
          setProfilePicture(auth.currentUser.photoURL);
          setIsGoogleUser(true);
          setUsername(auth.currentUser.displayName || "Google User");
        } else {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfilePicture(userData.profilePicture || defaultProfilePic);
            setUsername(userData.username || "User");
          }
          setIsGoogleUser(false);
        }
      }
    };

    loadUserData();
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowPopup(!showPopup); 
  };

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setNewProfilePicture(file);
      setUploadError("");
    } else {
      setUploadError("Please select a valid image file.");
    }
  };

  const handleSaveProfile = async () => {
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const updatedData = {};

      if (newUsername) updatedData.username = newUsername;

      if (newProfilePicture) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          updatedData.profilePicture = reader.result; 
          await updateDoc(userDocRef, updatedData);
          setProfilePicture(reader.result);
        };
        reader.readAsDataURL(newProfilePicture);
      } else {
        await updateDoc(userDocRef, updatedData);
      }

      if (newUsername) setUsername(newUsername);

      setNewUsername("");
      setNewProfilePicture(null);
      setShowPopup(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const handleFilterClick = (filterType) => {
    setCurrentFilter(filterType);
    onFilterChange(filterType);
  };

  
  return (
    <div>
      <div className='greetings'>
        <h1>Hello, {username}</h1>
      </div>
      <div className='container'>
        <div className='navbar-container'>
          <div className='add-task'>
            <button onClick={onAddTask}>Add Task</button>
          </div>
          <div className='remove-task'>
            <button onClick={onRemoveTask}>Remove Task</button>
          </div>
          <div className='log-out'>
            <button onClick={handleLogout}>Log Out</button>
          </div>
        </div>
        <div className='profile-container'>
          <img 
            className='profile' 
            src={profilePicture} 
            alt='pfp' 
            onClick={handleProfileClick}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>
      <div className='search-container'>
        <div className='search-bar-container'>
          <input 
            className='search-bar'
            type="text" 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={handleSearchChange}>  
          </input>
        </div>
        <div className='filter'>
          <button onClick={() => handleFilterClick("All")} className={currentFilter === "All" ? 'active-filter' : ''}>All</button>
        </div>
        <div className='filter'>
          <button onClick={() => handleFilterClick("Ticked")} className={currentFilter === "Ticked" ? 'active-filter' : ''}>Ticked</button>
        </div>
        <div className='filter'>
          <button onClick={() => handleFilterClick("Unticked")} className={currentFilter === "Unticked" ? 'active-filter' : ''}>Unticked</button>
        </div>
      </div>

      {showPopup && (
        <div className='profile-popup-container'>
          <div className="profile-popup">
            <h2>Edit Profile</h2>
            <input 
              type="text" 
              placeholder="New Username" 
              value={newUsername} 
              onChange={handleUsernameChange} 
            />
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleProfilePictureChange} 
            />
            {uploadError && <div style={{ color: "red" }}>{uploadError}</div>}
            <button onClick={handleSaveProfile}>Save Changes</button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
