const { db } = require("../util/admin");

exports.like = (req, res) => {
  let userId = req.user.uid;
  if (userId == "anonymous")
    return res.status(400).json({ error: "Anonymous user" });
  let commentId = req.params.commentId;
  db.doc(`Comment/${commentId}`)
    .get()
    .then((interactDoc) => {
      if (!interactDoc.exists)
        return res.status(400).json({ error: "No such comment ID" });
      let like = [];
      let dislike = [];
      like = interactDoc.data().like || [];
      dislike = interactDoc.data().dislike || [];
      let likeIndex = like.findIndex((id) => id == userId);
      let dislikeIndex = dislike.findIndex((id) => id == userId);
      if (likeIndex >= 0) {
        like.splice(likeIndex, 1);
      } else if (dislikeIndex >= 0) {
        dislike.splice(dislikeIndex, 1);
        like.push(userId);
      } else {
        like.push(userId);
      }
      db.doc(`Comment/${commentId}`)
        .set(
          {
            like,
            dislike,
          },
          { merge: true }
        )
        .then(() => res.json({ message: "Liked" }))
        .catch((e) => res.status(400).json({ error: e.message }));
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};
exports.dislike = (req, res) => {
  let userId = req.user.uid;
  if (userId == "anonymous")
    return res.status(400).json({ error: "Anonymous user" });
  let commentId = req.params.commentId;
  db.doc(`Comment/${commentId}`)
    .get()
    .then((interactDoc) => {
      if (!interactDoc.exists)
        return res.status(400).json({ error: "No such comment ID" });
      let like = [];
      let dislike = [];
      like = interactDoc.data().like;
      dislike = interactDoc.data().dislike;
      let likeIndex = like.findIndex((id) => id == userId);
      let dislikeIndex = dislike.findIndex((id) => id == userId);
      if (dislikeIndex >= 0) {
        dislike.splice(dislikeIndex, 1);
      } else if (likeIndex >= 0) {
        like.splice(likeIndex, 1);
        dislike.push(userId);
      } else {
        dislike.push(userId);
      }
      db.doc(`Comment/${commentId}`)
        .set(
          {
            like,
            dislike,
          },
          { merge: true }
        )
        .then(() => res.json({ message: "Disliked" }))
        .catch((e) => res.status(400).json({ error: e.message }));
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};
