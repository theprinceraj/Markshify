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
  totalMarks,
  isPractical,
  sgpa,
  cgpa,
}) {
  try {
    if (
      !regNo ||
      !studentName ||
      !fatherName ||
      !motherName ||
      !courseName ||
      !semester ||
      !subCode ||
      !totalMarks ||
      isPractical == (undefined || null) ||
      !sgpa ||
      !cgpa
    ) {
      throw new Error(
        "One of the variables passed to uploadStudentData function is undefined or falsy"
      );
    }
    const studentRef = collection(db, "students");
    await addDoc(studentRef, {
      "Registration Number": parseInt(regNo),
      Name: studentName,
      "Father's Name": fatherName,
      "Mother's Name": motherName,
      "Course Name": courseName,
      Semester: parseInt(semester),
      "Subject Code": subCode,
      "Total Marks": parseInt(totalMarks),
      isPractical: isPractical,
      SGPA: parseFloat(sgpa),
      "Curr. GPA": parseFloat(cgpa),
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
