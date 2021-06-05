const sharp = require("sharp");
const User = require("../model/userSchema");
exports.imageUpload = async ({
  userId,
  buffer,
  crop,
  type,
  imageDestination,
}) => {
  let image = sharp(Buffer.concat(buffer));
  let newCrop = {};
  let width, height;
  await image.metadata().then((metadata) => {
    newCrop = {
      height: Math.round((crop.height * metadata.height) / 100),
      width: Math.round((crop.width * metadata.width) / 100),
      left: Math.round((crop.left * metadata.width) / 100),
      top: Math.round((crop.top * metadata.height) / 100),
    };
  });
  if (type == "avatar") {
    width = 140;
    height = 140;
  } else {
    width = 810;
    height = 450;
  }
  // 810, 450
  await image
    .extract({ ...newCrop })
    .resize(width, height)
    .toFormat("png")
    .toFile(imageDestination)
    .then(() => {
      User.updateOne(
        { _id: userId },
        {
          $set: {
            avatar: `http://localhost:3002/image/${userId}${type}.png`,
          },
        }
      );
    });
  return `http://localhost:3002/image/${userId}${type}.png`;
};
