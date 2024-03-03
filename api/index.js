import express from "express";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

const webMarkup = await fs.readFile("./public/index.html", (err) => {
  if (err) console.log(err.message, "\n", err.stack);
});
app.use("/", (req, res) => {
  res.send(webMarkup);
});

app.listen(port, () => {
  console.log("Made by Team Dhruv!");
});

export default app;
