const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/Hoovada", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.listen(3002);

//auth
const fbAuth = require("./util/fbAuth"); //ok
const adminAuth = require("./util/adminAuth"); //ok
const questionOwnerAuth = require("./util/questionOwnerAuth"); //ok
const commentOwnerAuth = require("./util/commentOwnerAuth"); //ok

//user ok
const {
  signUpWithEmail,
  signInWithEmail,
  checkAuthState,
  updateProfile,
  profile,
  changePassword,
  forgetPassword,
  updateAvatar,
  updateCoverImage,
  report,
} = require("./api/user");

//question ok
const {
  getQuestions,
  getQuestion,
  postQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByTopic,
  getQuestionsByUserId,
  findQuestionByKey,
  // findQuestionByKey,
} = require("./api/question");

const {
  postComment,
  updateComment,
  deleteComment,
  getCommentsInQuestion,
  getCommentsOfUser,
  getSpecificComment,
} = require("./api/comment");
const { like, dislike } = require("./api/interact");

//admin

const {
  createAdmin,
  deleteAdmin,
  resetPassword,
  disableUser,
  enableUserFromLog,
} = require("./api/manager");

//image

const { image } = require("./api/image");
///////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

//image

app.get("/image/:imageName", image);
//user

app.post("/signUpWithEmail", signUpWithEmail);
app.post("/signInWithEmail", signInWithEmail);
app.get("/checkAuthState", fbAuth, checkAuthState);
app.post("/updateProfile/:field", fbAuth, updateProfile);
app.post("/updateAvatar", fbAuth, updateAvatar);
app.post("/updateCoverImage", fbAuth, updateCoverImage);
app.get("/profile/:id", profile);
app.post("/changePassword", fbAuth, changePassword);
app.post("/forgetPassword", forgetPassword);
app.post("/report", fbAuth, report);

//////////////////////////////////////////////////////////////////////////////////

//question ok

// get all, limit 20
app.get("/getQuestions", getQuestions);

//get all, load next 20 by numberToSkip
app.get("/getQuestions/:numberToSkip", getQuestions);

//get by topic limit 20
app.get("/getQuestionsByTopic/:topic", getQuestionsByTopic);

//get by topic load next 20 by numberToSkip
app.get("/getQuestionsByTopic/:topic/:numberToSkip", getQuestionsByTopic);

//get by user id ,limit 20
app.get("/getQuestionsByUserId/:userId", getQuestionsByUserId);

//get by user id, load next 20 by numberToSkip
app.get("/getQuestionsByUserId/:userId/:numberToSkip", getQuestionsByUserId);

//get a question by id
app.get("/getQuestion/:id", getQuestion);

// post a question
app.post("/postQuestion", fbAuth, postQuestion);

//update a question by qid
app.put("/updateQuestion/:id", fbAuth, questionOwnerAuth, updateQuestion);

//delete question by qid
app.delete("/deleteQuestion/:id", fbAuth, questionOwnerAuth, deleteQuestion);

app.get("/findQuestionByKey/:key", findQuestionByKey);

//////////////////////////////////////////////////////////////////////////////////

//comment ok

//limit 20
app.get("/getCommentsInQuestion/:questionId", getCommentsInQuestion);

//get next 20 comment by question id and numberToSkip sort by time
app.get(
  "/getCommentsInQuestion/:questionId/:numberToSkip",
  getCommentsInQuestion
);

//
app.get("/getCommentsOfUser/:userId", getCommentsOfUser);

app.get("/getCommentsOfUser/:userId/:numberToSkip", getCommentsOfUser);

//get a specific comment
app.get("/getSpecificComment/:answerId", getSpecificComment);

// body requires answer and question (questionId)
app.post("/postComment", fbAuth, postComment);

// body requires answer or question (qId) and different from old
app.put("/updateComment/:id", fbAuth, commentOwnerAuth, updateComment);

// delete comment by Id
app.delete("/deleteComment/:id", fbAuth, commentOwnerAuth, deleteComment);

//////////////////////////////////////////////////////////////////////////////////

//interact not change

//
app.get("/like/:commentId", fbAuth, like);

//
app.get("/dislike/:commentId", fbAuth, dislike);

//////////////////////////////////////////////////////////////////////////////////

//admin finished

//body requires email, password, userName
app.post("/admin/createAdmin", adminAuth, createAdmin);

//
app.get("/admin/deleteAdmin/:adminId", adminAuth, deleteAdmin);

//body requires email
app.post("/admin/resetPassword", resetPassword);

//body requires dayToBan
app.post("/admin/disableUser/:id", adminAuth, disableUser);

//
app.get("/admin/enableUserFromLog/:disableLogId", adminAuth, enableUserFromLog);

// 8jSppc10mmeCNVRKsSx7sKtlEch1 O3HFSejZppPVA6CY0NIR
// app.post('/myFunc', myFunc);
