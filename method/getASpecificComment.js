const Question = require("../model/questionSchema");
const Comment = require("../model/commentSchema");
const User = require("../model/userSchema");

exports.getASpecificComment = async (id) => {
  let res;
  res = await Comment.findById(id)
    .then(async (data) => {
      if (!data) throw Error("No such comment");

      let comment = data._doc;

      //get Owner
      let owner = await User.findById(comment.owner).exec();
      let ownerTemp;
      if (!owner) ownerTemp = { userName: "Anonymous" };
      else {
        ownerTemp = owner._doc;
      }
      comment.owner = ownerTemp;

      //getQuestion
      let question = await Question.findById(comment.question).exec();
      let questionTemp;
      if (!question)
        questionTemp = { question: "Something wrong with this question" };
      else {
        questionTemp = question._doc;
      }
      comment.question = questionTemp;

      return comment;
    })
    .catch((e) => {
      throw Error(e.message);
    });

  return { comment: res };
};
