import { convertRomanNumeralToInteger } from "../utilities/extractRelevantInformation.js";
import { createRectangles } from "../utilities/tesseract/createRectangles.js";
import { getJobDone } from "../utilities/tesseract/getJobDone.js";
import { preProcessImage } from "../utilities/sharp/preProcessImage.js";
import { uploadStudentData } from "../utilities/firebase/uploadStudentData.js";

export async function scan(req, res) {
  const base64versionImage = req.body.image;
  if (!base64versionImage)
    return res
      .status(400)
      .json({ error: "Image data is missing in the request body" });

  const preProcessedImage = await preProcessImage(base64versionImage);
  try {
    const currentSemesterNumber = convertRomanNumeralToInteger(
      (await getJobDone(preProcessedImage, createRectangles("semester")))[0]
    );
    const [
      registrationNumber,
      studentName,
      fatherName,
      motherName,
      courseName,
    ] = await getJobDone(preProcessedImage, createRectangles("personal-info"));
    const [sgpa, cgpa] = await getJobDone(
      preProcessedImage,
      createRectangles("gpa")
    );
    const [
      theory1code,
      theory1marks,
      theory2code,
      theory2marks,
      theory3code,
      theory3marks,
      theory4code,
      theory4marks,
      theory5code,
      theory5marks,
    ] = await getJobDone(preProcessedImage, createRectangles("theory"));

    const formatted = `${registrationNumber} | ${currentSemesterNumber} | ${studentName} |${fatherName} | ${motherName} | ${courseName} | ${sgpa} | ${cgpa} | ${theory1code} | ${theory1marks} | ${theory2code} | ${theory2marks} | ${theory3code} | ${theory3marks} | ${theory4code} | ${theory4marks} | ${theory5code} | ${theory5marks}`;
    // console.log(formatted);

    await uploadStudentData({
      regNo: registrationNumber,
      studentName: studentName,
      fatherName: fatherName,
      motherName: motherName,
      courseName: courseName,
      semester: currentSemesterNumber,
      subCode: theory1code,
      totalMarks: theory1marks,
      isPractical: true,
      sgpa: sgpa,
      cgpa: cgpa,
    });

    res.json({
      ocrResponse: [registrationNumber, currentSemesterNumber],
      formattedString: formatted,
    });
  } catch (error) {
    console.error("Error processing OCR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
