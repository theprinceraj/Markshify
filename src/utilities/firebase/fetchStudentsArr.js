import { db } from "./firebaseInitialize.js";
import { collection, getDocs } from "firebase/firestore";
export async function fetchStudentsArr() {
  try {
    const studentRef = collection(db, "students");
    const studentSnapshot = await getDocs(studentRef);
    return studentSnapshot.docs.map((doc) => doc.data());
  } catch (e) {
    console.log("Error occured inside fetchStudentsArr function:\n", e);
  }
}
