import sharp from "sharp";
import fs from "fs";
let imageFile;
fs.readFileSync("./image.png").then((img) => {
  imageFile = img;
});

async function preProcessImage(InputImage) {
  sharp(InputImage)
    .extract({
      left: 167,
      top: 674,
      width: 2134,
      height: 1967,
    })
    .toFile("output.jpg", function (err) {});
}