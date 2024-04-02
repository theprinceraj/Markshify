import { db } from "./firebaseInitialize.js";
import { collection, addDoc } from "@firebase/firestore";

export async function uploadStudentData({
  regNo,
  studentName,
  fatherName,
  motherName,
  courseName,
  semester,
  subCode,
  subName,
  totalMarks,
  isPractical,
  sgpa,
  cgpa,
}) {
  try {
    const studentRef = collection(db, "students");
    await addDoc(studentRef, {
      registrationNumber: regNo,
      name: studentName,
      fatherName: fatherName,
      motherName: motherName,
      courseName: courseName,
      semester: semester,
      subCode: subCode,
      subName: subName,
      totalMarks: totalMarks,
      isPractical: isPractical,
      sgpa: sgpa,
      cgpa: cgpa,
    });
  } catch (err) {
    console.log("Error occured inside uploadStudentData function:\n", err);
  }
}

// await uploadStudentData({
//   regNo: 17102110031,
//   studentName: "Student1",
//   fatherName: "Father1",
//   motherName: "Mother1",
//   courseName: "B.Tech.",
//   semester: 1,
//   subCode: "SUB1",
//   subName: "Subject1",
//   totalMarks: 100,
//   isPractical: true,
//   sgpa: 9.0,
//   cgpa: 9.0,
// });