const { db } = require("../util/admin");
exports.getCommentsTemp = async (id) => {
  let comments = [];
  let cmts = await db.collection(`Comment`).where("question", "==", id).get();

  let commentQuery = cmts.docs;

  for (let i = 0; i < commentQuery.length; i++) {
    let cmt = commentQuery[i];
    let comment = cmt.data();
    comment.id = cmt.id;
    let owner = await db.doc(`User/${comment.owner}`).get().catch(e=>console.log);
    let ownerTemp;
    if (!owner.exists) ownerTemp = { userName: "anonymous" };

    ownerTemp = owner.data();
    ownerTemp.id = owner.id;

    comment.owner = ownerTemp;
    comment.commentAt = comment.commentAt.toDate().toISOString();
    comments.push(comment);
  }
  
  return comments;
};
