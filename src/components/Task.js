import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import './Task.css';

export default function Task({ task, onDelete, showDeleteIcons, onEdit }) {
  const [isChecked, setIsChecked] = useState(task.isChecked || false);

  const handleCheckboxChange = async (e) => {
    const newCheckedState = e.target.checked;
    setIsChecked(newCheckedState);

    try {
      const taskDocRef = doc(db, 'tasks', task.id);
      await updateDoc(taskDocRef, { isChecked: newCheckedState });
    } catch (error) {
      console.error("Error updating checkbox state: ", error);
    }
  };
  
  return (
    <div className={`task-container ${isChecked ? 'checked' : ''}`}>
      <div className='text-container'>
        <label className="check-box">
          <input 
            type='checkbox' 
            checked={isChecked} 
            onChange={handleCheckboxChange} 
          />
          <span className="checkmark"></span>
        </label>
        <div className='title'>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
        </div>
      </div>
      <div className='edit-delete'>
        <div className='edit'>
          <button onClick={() => onEdit(task)}>E</button>
        </div>
        <div className={`delete ${showDeleteIcons ? 'show' : ''}`}>
          <button onClick={() => onDelete(task.id)}>D</button>
        </div>
      </div>
    </div>
  );
}
