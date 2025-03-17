import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";

export const fetchTasks = async () => {
  const user = auth.currentUser;

  if (!user) {
    console.error("No user is logged in.");
    return [];
  }

  try {
    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    return [];
  }
};
