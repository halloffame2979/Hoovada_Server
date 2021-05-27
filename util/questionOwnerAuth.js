const Question = require("../model/questionSchema");

module.exports = (req, res, next) => {
  let userId = req.user.uid;
  if (userId == "anonymous")
    return res.status(400).json({ error: "Anonymous user" });

  if (!req.params.id) {
    return res.status(400).json({ error: "Invalid detail" });
  }

  let id = req.params.id;

  Question.findById(id)
    .then((question) => {
      if (!question)
        return res.status(400).json({ error: "Question not found" });
      if (req.user.uid == question._doc.owner) {
        req.question = question._doc;
        return next();
      } else throw Error("Wrong owner");
    })

    .catch((err) => {
      return res.status(400).json({ error: err.message });
    });
};
