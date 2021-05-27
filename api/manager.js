const { admin, firebase } = require("../util/admin");
const User = require("../model/userSchema");
const Comment = require("../model/commentSchema");
const Question = require("../model/questionSchema");
const DisableLog = require("../model/disableLogSchema");
const ReportLog = require("../model/reportLogSchema");
const Admin = require("../model/adminSchema");

const boss = ["omegadeath2979@gmail.com", "khonggioihan2979@gmail.com"];
exports.createAdmin = (req, res) => {
  let { email, password, userName } = req.body;
  if (!email || !password || !userName)
    return res.status(400).json({ error: "Missing field" });
  if (!boss.includes(req.user.email))
    return res.status(400).json({ error: "Request not allow" });
  let creator = req.user.uid;
  admin
    .auth()
    .createUser({
      email: email,
      emailVerified: false,
      password: password,
      disabled: false,
    })
    .then((userRecord) => {
      new Admin({
        _id: userRecord.id,
        userName: userName,
        email: email,
        createAt: new Date().toISOString(),
        createBy: creator,
      })
        .save()
        .then(() =>
          res.json({ message: `Created new admin id ${userRecord.id}` })
        )
        .catch((e) => res.status(400).json({ error: e.message }));
    })
    .catch((e) => {
      if ((e.code = "auth/email-already-exists")) {
        return new Admin({
          _id: userRecord.id,
          userName: userName,
          email: email,
          createAt: new Date().toISOString(),
          createBy: creator,
        })
          .save()
          .then(() =>
            res.json({ message: `Created new admin id ${userRecord.id}` })
          )
          .catch((e) => res.status(400).json({ error: e.message }));
      }
      return res.status(400).json({ error: e.message });
    });
};

exports.deleteAdmin = (req, res) => {
  let adminId = req.params.adminId;
  if (!boss.includes(req.user.email))
    return res.status(400).json({ error: "Request not allow" });

  Admin.deleteOne({ _id: adminId })
    .then(() => res.json({ message: `Deleted admin id ${adminId}` }))
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.resetPassword = (req, res) => {
  let { email } = req.body;
  //   if (email != req.user.email && !boss.includes(req.user.email))
  //     return res.status(400).json({ error: "Not allowed" });
  firebase
    .auth()
    .sendPasswordResetEmail(email)
    .then(() => {
      return res.json({ message: "Send password to email" });
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.disableUser = async (req, res) => {
  let id = res.params.id;
  let dayToBan = res.body.dayToBan;

  if (await Admin.findById(id))
    return res.status(400).json({ error: "Admin. Not allowed" });
  admin
    .auth()
    .updateUser(id, { disabled: true })
    .then(() => {
      new DisableLog({
        createAt: new Date(),
        userId: id,
        period: dayToBan,
      }).save();
    })
    .then(() => res.json({ message: `Ban user id ${id}` }))
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.enableUserFromLog = async (req, res) => {
  let disableLogId = res.params.disableLogId;
  let disableLog = await DisableLog.findById(disableLogId);
  let userId = disableLog._doc.userId;
  admin
    .auth()
    .updateUser(userId, { disabled: false })
    .then(() => {
      DisableLog.deleteOne({ _id: disableLog.id });
    })
    .then(() => res.json({ message: `Enable user id ${userId}` }))
    .catch((e) => res.status(400).json({ error: e.message }));
};
