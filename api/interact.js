const { db } = require("../util/admin");

const Question = require("../model/questionSchema");
const Comment = require("../model/commentSchema");
const User = require("../model/userSchema");

exports.like = (req, res) => {
  let userId = req.user.uid;
  if (userId == "anonymous")
    return res.status(400).json({ error: "Anonymous user" });
  let commentId = req.params.commentId;

  Comment.findById(commentId)
    .exec()
    .then((commentDoc) => {
      if (!commentDoc) return res.status(400).json({ error: "No such answer" });

      let comment = commentDoc._doc;
      let like = comment.like || [];
      let dislike = comment.dislike || [];
      let likeCount = comment.likeCount || 0;
      let dislikeCount = comment.dislikeCount || 0;
      let likeIndex = like.findIndex((id) => id == userId);
      let dislikeIndex = dislike.findIndex((id) => id == userId);

      if (likeIndex >= 0) {
        like.splice(likeIndex, 1);
        likeCount--;
      } else if (dislikeIndex >= 0) {
        dislike.splice(dislikeIndex, 1);
        like.push(userId);
        likeCount++;
        dislikeCount--;
      } else {
        like.push(userId);
        likeCount++;
      }

      Comment.updateOne(
        { _id: commentId },
        { $set: { like: like, dislike: dislike, likeCount: likeCount } }
      )
        .then((val) => res.json({ message: "Liked" }))
        .catch((e) => res.status(400).json({ error: e.message }));
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};
exports.dislike = (req, res) => {
  let userId = req.user.uid;
  if (userId == "anonymous")
    return res.status(400).json({ error: "Anonymous user" });
  let commentId = req.params.commentId;

  Comment.findById(commentId)
    .exec()
    .then((commentDoc) => {
      if (!commentDoc) return res.status(400).json({ error: "No such answer" });

      let comment = commentDoc._doc;
      let like = comment.like || [];
      let dislike = comment.dislike || [];
      let likeCount = comment.likeCount || 0;
      let dislikeCount = comment.dislikeCount || 0;
      let likeIndex = like.findIndex((id) => id == userId);
      let dislikeIndex = dislike.findIndex((id) => id == userId);

      if (dislikeIndex >= 0) {
        dislike.splice(dislikeIndex, 1);
        dislikeCount--;
      } else if (likeIndex >= 0) {
        like.splice(likeIndex, 1);
        dislike.push(userId);
        likeCount--;
        dislikeCount++;
      } else {
        dislike.push(userId);
        dislikeCount++;
      }

      Comment.updateOne(
        { _id: commentId },
        {
          $set: {
            like: like,
            dislike: dislike,
            likeCount: likeCount,
            dislikeCount: dislikeCount,
          },
        }
      )
        .then((val) => res.json({ message: "Disliked" }))
        .catch((e) => res.status(400).json({ error: e.message }));
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};
