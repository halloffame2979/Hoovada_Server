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
      let likes = [];
      let dislikes = [];
      likes = interactDoc.data().likes;
      dislikes = interactDoc.data().dislikes;
      let likeIndex = likes.findIndex((like) => like == userId);
      let dislikeIndex = dislikes.findIndex((dislike) => dislike == userId);
      if (likeIndex >= 0) {
        likes.splice(likeIndex, 1);
      } else if (dislikeIndex >= 0) {
        dislikes.splice(dislikeIndex, 1);
        likes.push(userId);
      } else {
        likes.push(userId);
      }
      db.doc(`Comment/${commentId}`)
        .set(
          {
            likes,
            dislikes,
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
      let likes = [];
      let dislikes = [];
      likes = interactDoc.data().likes;
      dislikes = interactDoc.data().dislikes;
      let likeIndex = likes.findIndex((like) => like == userId);
      let dislikeIndex = dislikes.findIndex((dislike) => dislike == userId);
      if (dislikeIndex >= 0) {
        dislikes.splice(dislikeIndex, 1);
      } else if (likeIndex >= 0) {
        likes.splice(likeIndex, 1);
        dislikes.push(userId);
      } else {
        dislikes.push(userId);
      }
      db.doc(`Comment/${commentId}`)
        .set(
          {
            likes,
            dislikes,
          },
          { merge: true }
        )
        .then(() => res.json({ message: "Disliked" }))
        .catch((e) => res.status(400).json({ error: e.message }));
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};
