import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("public"));

app.use(express.json({ limit: "10mb" }));
import { scan } from "../src/controllers/scanner.js";
app.use("/api/scan", scan);

app.get("/api", (req, res) => {
  res.send("API is running.");
});

app.listen(port, () => {
  console.log("Made by Team Dhruv✨!");
});

export default app;
