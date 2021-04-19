const { db } = require("../util/admin");
const { getCommentsTemp } = require("./getCommentsTemp");
exports.getQuestionsTemp = async (query) => {
  let isLast = false;
  let questionQuery = query.docs;
  let questions = [];

  if (questionQuery.length < 20) isLast = true;

  for (let i = 0; i < questionQuery.length; i++) {
    let q;
    let qCollection= questionQuery[i];
    let owner;

    let ownerTemp = {};
    q = qCollection.data();
    q.id = qCollection.id;
    let comments = await getCommentsTemp(q.id);

    q.comment = { commentCount: comments.length, comment: comments };

    owner = await db
      .doc(`User/${q.owner}`)
      .get()
      .catch((e) => {
        throw Error(e.message);
      });
    ownerTemp = owner.data();
    ownerTemp.id = owner.id;
    q.owner = ownerTemp;
    q.createAt = q.createAt.toDate().toISOString();
    questions.push(q);
  }
  return { questions, isLast };
};
