import { fetchStudentsArr } from "../utilities/firebase/fetchStudentsArr.js";
import { generateCSV } from "../utilities/csv/generateCSV.js";

export async function generate(req, res) {
  try {
    const csvBuffer = await generateCSV(await fetchStudentsArr());
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=marks.csv");
    res.send(csvBuffer);
  } catch (error) {
    console.log(`Error occured inside generate function:\n`, error);
    res.status(500).send("Internal Server Error");
  }
}
