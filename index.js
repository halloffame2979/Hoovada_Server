const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.listen(3001);

//auth
const fbAuth = require("./util/fbAuth");
const questionOwnerAuth = require("./util/questionOwnerAuth");
const commentOwnerAuth = require("./util/commentOwnerAuth");

//user
const {
  signUpWithEmail,
  signInWithEmail,
  updateProfile,
  profile,
} = require("./api/user");

//question
const {
  getQuestions,
  getQuestion,
  postQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByTopic,
  getQuestionsByUserId,
} = require("./api/question");

const {
  postComment,
  updateComment,
  deleteComment,
  getCommentsInQuestion,
  getSpecificComment,
} = require("./api/comment");
const { like, dislike } = require("./api/interact");

//user

app.post("/signUpWithEmail", signUpWithEmail);
app.post("/signInWithEmail", signInWithEmail);
app.post("/updateProfile", fbAuth, updateProfile);
app.get("/profile/:id", profile);

//question

app.get("/getQuestions", getQuestions); //limit 20
app.get("/getQuestions/:lastDocId", getQuestions); //load next 20 by last docId
app.get("/getQuestionsByTopic/:topic", getQuestionsByTopic); //limit 20
app.get("/getQuestionsByTopic/:topic/:lastDocId", getQuestionsByTopic); //load next 20 by last docId
app.get("/getQuestionsByUserId/:userId", getQuestionsByUserId); //limit 20
app.get("/getQuestionsByUserId/:userId/:lastDocId", getQuestionsByUserId); //load next 20 by last docId

app.get("/getQuestion/:id", getQuestion); //get Q by Id
app.post("/postQuestion", fbAuth, postQuestion); //post
app.put("/updateQuestion/:id", fbAuth, questionOwnerAuth, updateQuestion); //update by Q Id
app.delete("/deleteQuestion/:id", fbAuth, questionOwnerAuth, deleteQuestion); //delete Q at Id

//comment

app.get("/getCommentsInQuestion/:questionId", getCommentsInQuestion); //limit 20
app.get("/getCommentsInQuestion/:questionId/:lastDocId", getCommentsInQuestion); //get next 20 comment by question id
app.get("/getSpecificComment/:answerId", getSpecificComment);
app.post("/postComment", fbAuth, postComment);
app.put("/updateComment/:id", fbAuth, commentOwnerAuth, updateComment);
app.delete("/deleteComment/:id", fbAuth, commentOwnerAuth, deleteComment);

//interact
app.post("/like/:commentId", fbAuth, like);
app.post("/dislike/:commentId", fbAuth, dislike);

// 8jSppc10mmeCNVRKsSx7sKtlEch1 O3HFSejZppPVA6CY0NIR
// app.post('/myFunc', myFunc);
