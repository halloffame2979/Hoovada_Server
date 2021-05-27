const { admin } = require("./admin");
const Admin = require("../model/adminSchema");
module.exports = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      let userId = req.user.uid;
      Admin.findById(userId).then((data) => {
        if (!data) return res.status(400).json({ error: "Not admin account" });
        else {
          return next();
        }
      });
    })

    .catch((err) => {
      // req.user = {uid:'anonymous'};
      // return next();

      return res.status(400).json({ error: "Cannot decode" });
    });
};
