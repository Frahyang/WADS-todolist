import React, { useState } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import './AddTask.css';

export default function AddTask({ onClose, onAddTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      console.error("No user is logged in.");
      return;
    }

    try {
      const user = auth.currentUser;
      
      const newTask = { 
        title, 
        description, 
        userId: user.uid 
      };

      const docRef = await addDoc(collection(db, "tasks"), newTask);
      
      console.log("Task added with ID: ", docRef.id);

      onAddTask({ id: docRef.id, ...newTask }); 
      
      setTitle('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <div className='overlay'>
      <div className='popup'>
        <h2>Add Task</h2>
        <form onSubmit={handleSubmit}>
          <input
            className='form-title'
            type='text'
            placeholder='Enter Title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className='form-description'
            placeholder='Enter Description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <button className='submitting-task' type='submit'>Submit</button>
          <button className='submitting-task' type='button' onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}
