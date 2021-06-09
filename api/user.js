const { firebase } = require("../util/admin");
const { imageUpload } = require("../method/imageUpload");
const ObjectId = require("mongodb").ObjectID;
const User = require("../model/userSchema");
const Comment = require("../model/commentSchema");
const Question = require("../model/questionSchema");
const ReportLog = require("../model/reportLogSchema");
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const sharp = require("sharp");

const storagePath = "E:/Code/Storage/Hoovada_Server/";

const avatarUrl = `https://firebasestorage.googleapis.com/v0/b/hoidap-824bb.appspot.com/o/User%2F8jSppc10mmeCNVRKsSx7sKtlEch1-avatar.png?alt=media&token=8jSppc10mmeCNVRKsSx7sKtlEch1`;

const coverUrl = `https://firebasestorage.googleapis.com/v0/b/hoidap-824bb.appspot.com/o/User%2F8jSppc10mmeCNVRKsSx7sKtlEch1-coverImage.png?alt=media&token=8jSppc10mmeCNVRKsSx7sKtlEch1 `;

exports.signUpWithEmail = (req, res) => {
  let data = req.body;

  if (!data.userName) return res.status(400).json({ error: "No user name" });
  if (!data.email) return res.status(400).json({ error: "No email" });
  if (!data.password) return res.status(400).json({ error: "No password" });

  if (data.userName.trim().length == 0)
    return res.status(400).json({ error: "No user name" });
  if (data.email.trim().length == 0)
    return res.status(400).json({ error: "No email" });
  if (data.password.trim().length == 0)
    return res.status(400).json({ error: "No password" });

  let newUser = {
    email: data.email,
    password: data.password,
    userName: data.userName,
  };

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(async (userCredential) => {
      // Signed in
      var user = userCredential.user;
      user.sendEmailVerification();
      await new User({
        _id: user.uid,
        email: newUser.email,
        userName: newUser.userName,
        gender: "Other",
        birth: "",
        avatar: "",
        coverImage: "",
        bio: "",
        friend: [],
        topic: [],
        createAt: new Date().toISOString(),
      })
        .save()
        .catch((e) => res.status(400).json({ error: e.message }));

      return res.status(200).json({ message: "Sign up successfully" });
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      return res.status(400).json({ error: errorMessage });
      // ..
    });
};

exports.signInWithEmail = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      let user = userCredential.user;
      if (user.emailVerified) {
        userCredential.user.getIdToken(false).then((token) => {
          return res.json({ token });
        });
      } else {
        user.sendEmailVerification();
        throw new Error("Email is not verified");
      }
    })
    .catch((e) => {
      return res.status(400).json({ error: e.message });
    });
};

exports.checkAuthState = async (req, res) => {
  let id = req.user.uid;
  let user = await User.findById(id);
  if (user.banStatus) {
    return res.status(400).json({ error: "Banned user" });
  }
  return res.json({
    user: user,
    auth: true,
  });
};

exports.updateAvatar = (req, res) => {
  let busboy = new Busboy({
    headers: req.headers,
    limits: { files: 1 },
  });
  let userId = req.user?.uid || 0;
  let buffer = [];
  let crop = {};
  let imageDestination = storagePath + userId + "avatar.png";
  //left top width height

  busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
    if (!mimetype.includes("image")) {
      return res.status(400).json({ error: "Wrong image format" });
    }
    file.on("data", (data) => {
      buffer.push(data);
    });
    file.on("end", () => {});
  });

  busboy.on(
    "field",
    (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
      let data = JSON.parse(val);
      if (fieldname == "crop") {
        crop = {
          height: parseFloat(data.height),
          width: parseFloat(data.width),
          left: parseFloat(data.x),
          top: parseFloat(data.y),
        };
      }
    }
  );

  busboy.on("filesLimit", () => {
    return res.status(400).json({ error: "1 image is allowed" });
  });
  busboy.on("finish", async function () {
    try {
      let type = "avatar";

      await imageUpload({ userId, buffer, crop, type, imageDestination }).then(
        (url) => {
          res.json({ avatar: url });
        }
      );
    } catch (e) {
      console.log(e.message);
      res.status(400).json({ error: e.message });
    }
  });
  return req.pipe(busboy);
};
exports.updateCoverImage = (req, res) => {
  let busboy = new Busboy({
    headers: req.headers,
    limits: { files: 1, fields: 1 },
  });
  let userId = req.user?.uid || 0;
  let buffer = [];
  let crop = {};
  let originalSize = {};
  let imageDestination = storagePath + userId + "coverImage.png";
  //left top width height

  busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
    if (!mimetype.includes("image")) {
      return res.status(400).json({ error: "Wrong image format" });
    }
    file.on("data", (data) => {
      buffer.push(data);
    });
    file.on("end", () => {});
  });

  busboy.on(
    "field",
    (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
      let data = JSON.parse(val);
      if (fieldname == "crop") {
        crop = {
          height: parseInt(data.height),
          width: parseInt(data.width),
          left: parseInt(data.x),
          top: parseInt(data.y),
        };
      }
    }
  );

  busboy.on("filesLimit", () => {
    return res.status(400).json({ error: "1 image is allowed" });
  });
  busboy.on("finish", async function () {
    try {
      let type = "coverImage";

      await imageUpload({ userId, buffer, crop, type, imageDestination }).then(
        (url) => {
          res.json({ coverImage: url });
        }
      );
    } catch (e) {
      console.log(e.message);
      res.status(400).json({ error: e.message });
    }
  });
  return req.pipe(busboy);
};

exports.updateProfile = (req, res) => {
  let userDetail = req.body;
  let field = req.params.field;
  userDetail.id = req.user.uid;
  if (userDetail.id == "anonymous")
    return res.status(400).json({ error: "Anonymous user" });
  if (field != "birth" && !userDetail[field])
    return res.status(400).json({ error: "Missing field" });
  const query = { _id: userDetail.id };
  let allowed = ["bio", "birth", "gender", "userName"];
  if (!allowed.includes(field))
    return res.status(400).json({ error: "Not allowed" });
  switch (field) {
    case "birth": {
      if (!userDetail.year || !userDetail.month || !userDetail.date)
        return res
          .status(400)
          .json({ error: "Wrong birth. Need year, month, date" });
      let date = new Date(
        userDetail.year,
        userDetail.month - 1,
        userDetail.date
      ).toISOString();
      User.updateOne(query, { $set: { birth: date } })
        .then(() => res.json({ message: "Updated Birth" }))
        .catch((e) => res.status(400).json({ error: e.message }));
      return;
    }
    default: {
      User.updateOne(query, { $set: { [field]: userDetail[field] } })
        .then(() => res.json({ message: `Updated ${field}` }))
        .catch((e) => res.status(400).json({ error: e.message }));
      return;
    }
  }
};

exports.changePassword = (req, res) => {
  let userEmail = req.user.email;
  let { password, newPassword } = req.body;
  // if (userEmail != email) return res.status(400).json({ error: "Wrong user" });
  if (!newPassword || !newPassword?.trim())
    return res.status(400).json({ error: "Invalid new password" });
  firebase
    .auth()
    .signInWithEmailAndPassword(userEmail, password)
    .then((credential) => {
      let user = credential.user;
      user
        .updatePassword(newPassword)
        .then(() => res.json({ message: "Change password succesfully" }))
        .catch((e) => res.status(400).json({ error: e.message }));
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.forgetPassword = (req, res) => {
  let { email } = req.body;
  firebase
    .auth()
    .sendPasswordResetEmail(email)
    .then(() => {
      return res.json({ message: "Send password to email" });
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.profile = (req, res) => {
  let id = req.params.id;

  User.findById(id)
    .then(async (data) => {
      if (!data) return res.status(400).json({ error: "No such user" });

      let user = data._doc;

      // user.avatar = user.avatar;
      // user.coverImage = user.coverImage;
      return res.json(user);
    })
    .catch((e) => {
      return res.status(404).json({ error: e.message });
    });
};
exports.report = (req, res) => {
  let id = req.user.uid;
  let report = req.body;
  let type = req.query.type;

  report.createAt = new Date();
  report.reporter = id;
  report.reportDetail = ["Không phù hợp"];

  if (type !== "Question" && type != "Comment")
    return res.status(400).json({ error: "Type not allowed" });

  if (report?.reported) {
    // res.json({ ...report });
    return new ReportLog({
      ...report,
      reportedType: type,
      _id: new ObjectId(),
    })
      .save()
      .then((val) => res.json(val))
      .catch((e) => res.status(400).json({ error: e.message }));
  } else return res.json("null");
};
