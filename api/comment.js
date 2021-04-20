const { db, admin } = require("../util/admin");
const { getASpecificComment } = require("../method/getASpecificComment");

exports.getCommentsInQuestion = async (req, res) => {
  let questionId = req.params.questionId;
  let lastDocId = req.params.lastDocId;
  let comments = [];
  let isLast = false;
  let question = await db.collection("Question").doc(questionId).get();
  if (!question.exists)
    return res.status(400).json({ error: "No such question" });

  if (lastDocId) {
    let lastDoc = await db.collection("Comment").doc(lastDocId).get();
    if (!lastDoc.exists)
      return res.status(400).json({ error: "No such comment" });

    db.collection("Comment")

      .where("question", "==", questionId)
      .startAfter(lastDoc)
      .limit(20)
      .get()
      .then((doc) => {
        let query = doc.docs;
        if (query.length < 20) isLast = true;
        query.forEach((doc) => {
          let comment = doc.data();
          comment.id = doc.id;
          comment.commentAt = comment.commentAt.toDate().toISOString();
          comments.push(comment);
        });
        return res.json({ comments, isLast });
      })
      .catch((e) => res.json({ error: e.message }));
  } else {
    db.collection("Comment")
      .where("question", "==", questionId)
      .limit(20)
      .get()
      .then((doc) => {
        let query = doc.docs;
        if (query.length < 20) isLast = true;
        query.forEach((doc) => {
          let comment = doc.data();
          comment.id = doc.id;
          comment.commentAt = comment.commentAt.toDate().toISOString();
          comments.push(comment);
        });

        return res.json({ comments, isLast });
      })
      .catch((e) => res.json({ error: e.message }));
  }
};

exports.getSpecificComment = (req, res) => {
  let id = req.params.answerId;
  // res.json(id);
  getASpecificComment(id)
    .then((data) => {
      return res.json(data);
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.postComment = async (req, res) => {
  let detail = req.body;
  if (!detail.question || !detail.detail)
    return res.status(400).json({ error: "Invalid comment" });
  let q = await db.collection("Question").doc(detail.question).get();
  if (!q.exists) return res.json({ error: "No such question" });
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
  let detail = req.body.detail || req.comment.detail;
  if (!req.body.detail)
    return res.status(400).json({ error: "Comment is required" });
  if (!detail.trim())
    return res.status(400).json({ error: "Invalid comment" });

  if (typeof detail != "string")
    return res.status(400).json({ error: "Comment must be string" });

  if (detail.trim() == req.comment.detail)
    return res.status(400).json({ error: "Detail does not change" });

  let id = req.params.id;
  

  db.collection("Comment")
    .doc(id)
    .set(
      {
        detail: detail,
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
