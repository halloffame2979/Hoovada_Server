const ObjectId = require("mongoose").Types.ObjectId;
const Question = require("../model/questionSchema");
const Comment = require("../model/commentSchema");
const User = require("../model/userSchema");

// const Question = require('../model/questionSchema');

exports.getQuestions = async (req, res) => {
  let numberToSkip = parseInt(req.params.numberToSkip) || 0;
  let sort = req.query.sort;
  let sortQuery;
  if (sort == "newest") sortQuery = { createAt: -1 };
  else sortQuery = { commentCount: -1 };
  Question.find()
    .sort(sortQuery)
    .skip(parseInt(numberToSkip))
    .limit(20)
    .exec()
    .then(async (questionQuery) => {
      let isLast = false;
      let questions = [];
      let total = numberToSkip + questionQuery.length;

      if (questionQuery.length < 20) isLast = true;

      for (let i = 0; i < questionQuery.length; i++) {
        let q = questionQuery[i]._doc;
        let owner;

        let ownerTemp = {};

        owner = await User.findById(q.owner).catch((e) => {
          console.log(e);
          throw Error(e.message);
        });
        ownerTemp = owner._doc;
        q.owner = ownerTemp;
        questions.push(q);
      }
      return res.json({ questions, isLast, total });
    })
    .catch((e) => res.json(e.message));
};

exports.getQuestionsByTopic = async (req, res) => {
  let topic = req.params.topic.trim();
  let numberToSkip = parseInt(req.params.numberToSkip) || 0;

  Question.find({ topic: topic })
    .skip(parseInt(numberToSkip))
    .limit(20)
    .exec()
    .then(async (questionQuery) => {
      let isLast = false;
      let questions = [];
      let total = numberToSkip + questionQuery.length;

      if (questionQuery.length < 20) isLast = true;

      for (let i = 0; i < questionQuery.length; i++) {
        let q = questionQuery[i]._doc;
        let owner;

        let ownerTemp = {};

        owner = await User.findById(q.owner).catch((e) => {
          console.log(e);
          throw Error(e.message);
        });
        ownerTemp = owner._doc;
        q.owner = ownerTemp;
        questions.push(q);
      }
      return res.json({ questions, isLast, total });
    })
    .catch((e) => res.json(e.message));
};

exports.getQuestionsByUserId = async (req, res) => {
  let userId = req.params.userId;
  let numberToSkip = parseInt(req.params.numberToSkip) || 0;
  let questionsList = [];

  let user = await User.findById(userId);
  if (!user) return res.status(400).json({ error: "No such user" });

  Question.find({ owner: userId })
    .sort({ commentCount: -1 })
    .skip(numberToSkip)
    .limit(20)
    .exec()
    .then((questions) => {
      let total = questions.length + numberToSkip;
      let isLast = false;
      if (questions.length < 20) isLast = true;
      for (let i = 0; i < questions.length; i++) {
        let question = questions[i]._doc;
        // question.owner = user;
        questionsList.push(question);
      }

      return res.json({
        question: questionsList,
        isLast: isLast,
        total: total,
      });
    })
    .catch((e) => res.json(e.message));
};

exports.getQuestion = (req, res) => {
  let id = req.params.id;
  Question.findById(id)
    .then((doc) => {
      if (!doc) return res.status(400).json({ error: "No such question" });
      let question = doc._doc;
      User.findById(question.owner)
        .then((user) => {
          question.owner = user._doc;
          return res.json(question);
        })
        .catch((e) =>
          res.status(400).json({ error: "Something wrong with User" })
        );
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.postQuestion = (req, res) => {
  let detail = req.body;
  let id = req.user.uid;

  if (id == "anonymous")
    return res.status(400).json({ error: "Anonymous user" });
  if (!detail.question || !detail.topic)
    return res.status(400).json({ error: "Invalid question" });
  if (typeof detail.question != "string" || !Array.isArray(detail.topic))
    return res.status(400).json({ error: "Invalid question" });
  if (!detail.question.trim())
    return res.status(400).json({ error: "Invalid question" });
  if (!detail.topic.length > 0)
    return res.status(400).json({ error: "Invalid question" });

  new Question({
    _id: new ObjectId(),
    owner: id,
    question: detail.question,
    topic: detail.topic,
    createAt: new Date(),
    commentCount: 0,
  })
    .save()
    .then((doc) => {
      res.json(doc._doc);
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.updateQuestion = async (req, res) => {
  let detail = req.body;

  if (!detail.question && !detail.topic)
    return res.status(400).json({ error: "Invalid update question" });
  if (typeof detail.question != "string" || !Array.isArray(detail.topic))
    return res
      .status(400)
      .json({ error: "Question must be string and topic must be array" });
  if (!detail.question.trim())
    return res.status(400).json({ error: "question required" });
  if (!detail.topic.length > 0)
    return res.status(400).json({ error: "topic required" });

  detail.question = req.body.question.trim() || req.question.question;
  detail.topic = req.body.topic || req.question.topic;

  if (
    detail.question.trim() == req.question.question &&
    detail.topic.toString() == req.question.topic.toString()
  )
    return res.status(400).json({ error: "Details do not change" });

  detail.id = req.params.id;

  Question.updateOne(
    { _id: detail.id },
    {
      $set: {
        question: detail.question,
        topic: detail.topic,
      },
    }
  )
    .then((result) => res.json({ message: "Update question successfully" }))
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.deleteQuestion = async (req, res) => {
  let id = req.params.id;
  Question.deleteOne({ _id: id })
    .then((_) => {
      Comment.deleteMany({ question: id })
        .then(() => res.json({ message: "Delete question successfully" }))
        .catch((e) => res.status(400).json({ error: e.message }));
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

// var queryForSearch =
//   .then((data) => {
//     console.log("cakk");
//     return data;
//   });

// setInterval(() => {
//   queryForSearch = db
//     .collection("Question")
//     .get()
//     .then((data) => {
//       return data;
//     });
// }, 3600000);
// new RegExp(`(${regex})`, "i")
exports.findQuestionByKey = async (req, res) => {
  let keys = req.params.key;
  keys = keys.split(/\s+/).map((key) => `(?=.*${key}){1,}`);

  let regex = keys.join("");

  let docs = await Question.find({
    question: { $regex: new RegExp(`^${regex}`, "i") },
  })
    .sort({ commentCount: -1 })
    .exec();
  res.json(docs.map((doc) => doc._doc));
  // console.log(docs.length);
  // let result = docs.filter((data) => {
  //   let check = true;
  //   keys.forEach((key) => {
  //     check = check && data.question.toLowerCase().includes(key);
  //   });
  //   return check;
  // });
  // return res.json(result);
};
