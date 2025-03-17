import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function RemoveTask({ tasks, setTasks, showDeleteIcons, setShowDeleteIcons }) {

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      console.log("Task deleted successfully!");

      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error.message);
    }
  };

  const toggleRemoveTask = () => {
    setShowDeleteIcons(!showDeleteIcons);
  };

  return { handleDeleteTask, toggleRemoveTask };
}
