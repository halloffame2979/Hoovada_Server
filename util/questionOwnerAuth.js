const { admin, db } = require("./admin");

module.exports = (req, res, next) => {
  let userId = req.user.uid;
  if (userId == "anonymous")
    return res.status(400).json({ error: "Anonymous user" });

  let id;
  if (req.params.id) {
    id = req.params.id;
  } else {
    return res.status(400).json({ error: "Invalid detail" });
  }

  db.collection("Question")
    .doc(id)
    .get()
    .then((question) => {
      if (!question.exists)
        return res.status(400).json({ error: "Question not found" });
      if (req.user.uid == question.data().owner) {
        req.question = question.data();
        req.question.id = question.id;
        return next();
      } else throw Error("Wrong owner");
    })

    .catch((err) => {
      return res.status(400).json({ error: err.message });
    });
};
