const fs = require("fs");

exports.image = (req, res) => {
  const path = "E:/Code/Storage/Hoovada_Server/";
  const url = path + req.params.imageName;
  if (fs.existsSync(url)) {
    res.sendFile(url);
  } else res.status(400).json({ error: "No image" });
};
