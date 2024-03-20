import sharp from "sharp";

export async function preProcessImage(imageBuffer) {
  const response = await sharp(imageBuffer)
    .extract({ width: 2113, height: 1807, top: 805, left: 181 })
    .greyscale()
    .toFile("outputImage2.png")
    .toBuffer();

  return response;
}
