const { getASpecificComment } = require("../method/getASpecificComment");
const Question = require("../model/questionSchema");
const Comment = require("../model/commentSchema");
const User = require("../model/userSchema");
const { ObjectId } = require("bson");

exports.getCommentsInQuestion = async (req, res) => {
  let questionId = req.params.questionId;
  let numberToSkip = parseInt(req.params.numberToSkip) || 0;
  let comments = [];
  let isLast = false;
  let question = await Question.findById(questionId);
  if (!question) return res.status(400).json({ error: "No such question" });

  Comment.find({ question: questionId })
    .sort({ likeCount: -1 })
    .skip(numberToSkip)
    .limit(20)
    .exec()
    .then(async (doc) => {
      let query = doc;
      let total = numberToSkip + doc.length;

      if (query.length < 20) isLast = true;
      for (let i = 0; i < query.length; i++) {
        let comment = query[i]._doc;

        let owner = await User.findById(comment.owner).exec();
        comment.owner = owner;

        comments.push(comment);
      }
      return res.json({ comment: comments, isLast: isLast, total: total });
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.getSpecificComment = (req, res) => {
  let id = req.params.answerId;
  getASpecificComment(id)
    .then((data) => {
      return res.json(data);
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.getCommentsOfUser = async (req, res) => {
  let userId = req.params.userId;
  let numberToSkip = parseInt(req.params.numberToSkip) || 0;
  let isLast = false;
  let comments = [];
  let user = await User.findById(userId);
  if (!user) return res.status(400).json({ error: "No such user" });

  Comment.find({ owner: userId })
    .sort({ likeCount: -1 })
    .skip(numberToSkip)
    .limit(20)
    .exec()
    .then(async (doc) => {
      let query = doc;
      let total = doc.length + numberToSkip;
      if (query.length < 20) isLast = true;
      for (let i = 0; i < query.length; i++) {
        let comment = query[i]._doc;

        let question = await Question.findById(comment.question).exec();
        comment.question = question;
        comments.push(comment);
      }
      return res.json({ comment: comments, isLast: isLast, total: total });
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};
exports.postComment = async (req, res) => {
  let answer = req.body;
  if (!answer.question || !answer.answer)
    return res.status(400).json({ error: "Invalid comment" });
  let q = await Question.findById(answer.question).exec();
  if (!q) return res.status(400).json({ error: "No such question" });
  new Comment({
    _id: new ObjectId(),
    createAt: new Date(),
    answer: answer.answer,
    like: [],
    dislike: [],
    owner: req.user.uid,
    question: answer.question,
  })
    .save()
    .then((doc) => {
      Question.updateOne(
        { _id: answer.question },
        { $inc: { commentCount: 1 } }
      )
        .then(() => res.json(doc))
        .catch((e) => res.status(400).json({ error: e.message }));
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};
exports.updateComment = async (req, res) => {
  if (!req.body.answer)
    return res.status(400).json({ error: "Comment is required" });
  if (!answer.trim()) return res.status(400).json({ error: "Invalid comment" });

  if (typeof answer != "string")
    return res.status(400).json({ error: "Comment must be string" });

  if (answer.trim() == req.comment.answer)
    return res.status(400).json({ error: "Answer does not change" });

  let id = req.params.id;

  Comment.updateOne(
    { _id: id },
    {
      $set: {
        answer: answer,
      },
    }
  )
    .then((result) => res.json({ message: "Update comment successfully" }))
    .catch((e) => res.status(400).json({ error: e.message }));
};
exports.deleteComment = (req, res) => {
  let id = req.params.id;
  // res.json(req.comment.question);

  Comment.deleteOne({ _id: id })
    .then((_) => {
      Question.updateOne(
        { _id: req.comment.question },
        { $inc: { commentCount: -1 } }
      )
        .then(() => res.json({ message: "Delete comment succesfully" }))
        .catch((e) => {
          new Comment(req.comment).save();
          res.status(400).json({ error: e.message });
        });
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

//6085270a4b069e051418301a
