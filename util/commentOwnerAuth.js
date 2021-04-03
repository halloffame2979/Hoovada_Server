const { admin, db } = require("./admin");

module.exports = (req, res, next) => {
  let userId = req.user.uid;
  if (userId == "anonymous")
    return res.status(400).json({ error: "Anonymous user" });
  let id;
  if (req.params.id) {
    id = req.params.id;
  } else {
    return res.status(404).json({ error: "Bad request" });
  }

  db.collection("Comment")
    .doc(id)
    .get()
    .then(
      (comment) => {
        if (!comment.exists) throw Error("Comment not found");
        if (req.user.uid == comment.data().owner && comment.data()) {
          req.comment = comment.data();
          req.comment.id = comment.id;
          return next();
        } else throw Error("Wrong owner");
      },
      (e) => res.status(400).json({ error: e.message })
    )

    .catch((e) => {
      return res.status(400).json({ error: e.message });
    });
};
