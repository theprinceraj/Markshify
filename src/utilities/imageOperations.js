const sharp = require("sharp")

sharp("image.png")
.resize({ width: 2181, height: 2164 })
.greyscale()
.toFile("outputImage1.png");