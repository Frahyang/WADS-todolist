import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, deleteDoc, doc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, setPersistence, browserLocalPersistence, signOut } from 'firebase/auth';
import NavBar from './components/NavBar';
import Task from './components/Task';
import AddTask from './components/AddTask';
import EditTask from './components/EditTask';
import Login from './components/Login';
import SignUp from './components/SignUp';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showDeleteIcons, setShowDeleteIcons] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasLoadedTasks, setHasLoadedTasks] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch(error => console.error("Error setting persistence:", error));

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        navigate('/todolist');
      } else {
        setIsLoggedIn(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isLoggedIn && !hasLoadedTasks) {
      loadTasks();
    }
  }, [isLoggedIn, hasLoadedTasks]);

  useEffect(() => {
    applyFilter();
  }, [tasks, searchTerm, filter]);

  const loadTasks = async () => {
    if (auth.currentUser) {
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('userId', '==', auth.currentUser.uid));

      const querySnapshot = await getDocs(q);
      const loadedTasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setTasks(loadedTasks);
      setHasLoadedTasks(true);
    }
  };

  const handleAddTask = async (newTask) => {
    if (auth.currentUser) {
      await loadTasks();
      setShowAddTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (auth.currentUser) {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
  };

  const handleSaveTask = async (updatedTask) => {
    if (auth.currentUser && taskToEdit) {
      const taskDoc = doc(db, 'tasks', taskToEdit.id);
      await updateDoc(taskDoc, updatedTask);

      const updatedTasks = tasks.map(task =>
        task.id === taskToEdit.id ? { ...task, ...updatedTask } : task
      );

      setTasks(updatedTasks);
      setTaskToEdit(null);
    }
  };

  const applyFilter = () => {
    let filtered = tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filter === "Ticked") {
      filtered = filtered.filter(task => task.isChecked === true);
    } else if (filter === "Unticked") {
      filtered = filtered.filter(task => task.isChecked === false || task.isChecked === undefined);
    }

    setFilteredTasks(filtered);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setTasks([]);
      setHasLoadedTasks(false);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
      <Route path="/signup" element={<SignUp onGoogleSignIn={() => setIsLoggedIn(true)} />} />
      <Route
        path="/todolist"
        element={
          isLoggedIn ? (
            <div className="App">
              <NavBar
                onAddTask={() => setShowAddTask(true)}
                onRemoveTask={() => setShowDeleteIcons(!showDeleteIcons)}
                onLogout={handleLogout}
                onSearch={setSearchTerm}
                onFilterChange={setFilter}
              />

              {showAddTask && (
                <AddTask
                  onClose={() => setShowAddTask(false)}
                  onAddTask={handleAddTask}
                />
              )}

              <div className='task-list'>
                {filteredTasks.map((task) => (
                  <Task
                    key={task.id}
                    task={task}
                    onDelete={() => handleDeleteTask(task.id)}
                    showDeleteIcons={showDeleteIcons}
                    onEdit={handleEditTask}
                  />
                ))}
              </div>

              {taskToEdit && (
                <EditTask
                  currentTask={taskToEdit}
                  onSave={handleSaveTask}
                  onClose={() => setTaskToEdit(null)}
                />
              )}
            </div>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}
