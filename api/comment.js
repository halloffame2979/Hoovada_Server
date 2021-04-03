const { db, admin } = require("../util/admin");

exports.postComment = async (req, res) => {
  let detail = req.body;
  if (!detail.question || !detail.detail)
    return res.status(400).json({ error: "Invalid comment" });
  let q = await db.collection("Question").doc(detail.question).get();
  if (!q.exists)
    return res.json({ error: "No such question" });
  db.collection("Comment")
    .add({
      owner: req.user.uid,
      question: detail.question,
      detail: detail.detail,
      commentAt: admin.firestore.Timestamp.fromDate(new Date()),
      like: [],
      dislikes: [],
    })
    .then((doc) => {
      res.json({ message: "Comment successfully" });
    })
    .catch((e) => res.json({ error: e.message }));
};
exports.updateComment = async (req, res) => {
  let detail;

  if (!req.body.detail.trim())
    return res.status(400).json({ error: "Invalid comment change" });

  if (req.body.detail == req.comment.detail)
    return res.status(400).json({ error: "Detail does not change" });
  detail = req.body;
  detail.id = req.params.id;

  db.collection("Comment")
    .doc(detail.id)
    .set(
      {
        detail: detail.detail,
      },
      { merge: true }
    )
    .then((result) => res.json({ message: "Update question successfully" }))
    .catch((e) => res.status(400).json({ error: e.message }));
};
exports.deleteComment = (req, res) => {
  let id = req.params.id;
  db.doc(`Comment/${id}`)
    .delete()
    .then((_) => {
      res.json({ message: "Delete comment succesfully" });
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};
