const { db } = require("../util/admin");
const {getCommentsTemp} = require("./getCommentsTemp");
exports.getOneQuestionTemp = async (doc) => {

  if (!doc.exists) return res.status(400).json({ error: "Question not found" });
  let question = doc.data();
  question.createAt = question.createAt.toDate().toISOString();
  question.id = doc.id;

  let comments = await getCommentsTemp(question.id);

  question.comment = { commentCount: comments.length, comment: comments };

  owner = await db
    .doc(`User/${question.owner}`)
    .get()
    .catch((e) => {
      throw Error(e.message);
    });
  ownerTemp = owner.data();
  ownerTemp.id = owner.id;
  question.owner = ownerTemp;

  return {question};
};
