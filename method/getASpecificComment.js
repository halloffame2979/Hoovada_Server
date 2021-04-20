const { db } = require("../util/admin");

exports.getASpecificComment = async (id) => {
  let res;
  res = await db
    .doc(`Comment/${id}`)
    .get()
    .then(async (data) => {
      if (!data.exists) throw Error("No such comment");

      let comment = data.data();
      comment.id = data.id;
      comment.commentAt = comment.commentAt.toDate().toISOString();

      //get Owner
      let owner = await db.doc(`User/${comment.owner}`).get();
      let ownerTemp;
      if (!owner.exists) ownerTemp = { userName: "Anonymous" };
      else {
        ownerTemp = owner.data();
        ownerTemp.id = owner.id;
      }
      comment.owner = ownerTemp;

      //getQuestion
      let question = await db.doc(`Question/${comment.question}`).get();
      if (!question.exists)
        question = { question: "Something wrong with this question" };
      else {
        let questionTemp;
        questionTemp = question.data();
        questionTemp.id = question.id;
        questionTemp.createAt = questionTemp.createAt.toDate().toISOString();
        question = questionTemp;
      }
      comment.question = question;

      return comment;
    })
    .catch((e) => {
      throw Error(e.message);
    });

  return { comment: res };
};
