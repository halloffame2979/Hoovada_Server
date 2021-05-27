const Comment = require("../model/commentSchema");

module.exports = (req, res, next) => {
  let userId = req.user.uid;
  if (userId == "anonymous")
    return res.status(400).json({ error: "Anonymous user" });
  if (!req.params.id) {
    return res.status(404).json({ error: "Bad request" });
  }

  id = req.params.id;
  Comment.findById(id)
    .then(
      (comment) => {
        if (!comment) throw Error("Comment not found");
        if (req.user.uid == comment._doc.owner) {
          req.comment = comment._doc;
          return next();
        } else throw Error("Wrong owner");
      },
      (e) => res.status(400).json({ error: e.message })
    )

    .catch((e) => {
      return res.status(400).json({ error: e.message });
    });
};
