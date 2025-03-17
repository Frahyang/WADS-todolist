import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './AddTask.css';

export default function EditTask({ currentTask, onSave, onClose }) {
  const [title, setTitle] = useState(currentTask.title);
  const [description, setDescription] = useState(currentTask.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title.trim() === '' || description.trim() === '') {
      setError("Title and description cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const taskRef = doc(db, "tasks", currentTask.id);

      await updateDoc(taskRef, { title, description });
      console.log("Task updated successfully!");

      onSave({ id: currentTask.id, title, description });
      onClose();
      
    } catch (error) {
      console.error("Error updating task:", error.message);
      setError("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="popup">
        <h2>Edit Task</h2>
        <form onSubmit={handleSubmit}>
          <input
            className='form-title'
            type="text"
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
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}
