const { db, admin, storage, firebase } = require("../util/admin");

exports.getQuestions = (req, res) => {
  db.collection("Question")
    .orderBy("createAt",'desc')
    .limit(20)
    .get()
    .then((collection) => {
      let questionsCollections = collection.docs;
      let questions = [];
      let q;
      questionsCollections.forEach((qCollection) => {
        q = qCollection.data();
        q.id = qCollection.id;
        q.createAt = q.createAt.toDate().toISOString();
        questions.push(q);
      });

      return res.json(questions);
    })
    .catch((e) => res.json(e.message));
};

exports.getNext20Questions = async (req, res) => {
  let startAfter = req.params.lastQuestionId;

  let last = await db.collection("Question").doc(startAfter).get();

  if (!last.exists) return res.status(400).json({ error: "No such question" });

  db.collection("Question")
  .orderBy("createAt",'desc')
    .startAfter(last)
    .limit(20)
    .get()
    .then((query) => {
      let questions = [];
      let question;
      query.docs.forEach((doc) => {
        question = doc.data();
        question.id = doc.id;
        question.createAt = question.createAt.toDate().toISOString();
        questions.push(question);
      });
      return res.json(questions);
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.getQuestionsByTopic = (req, res) => {
  let topic = req.params.topic;

  db.collection("Question")
    .orderBy("createAt",'desc')
    .where("topic", "=", topic)
    .limit(20)
    .get()
    .then((collection) => {
      let questionsCollections = collection.docs;
      let questions = [];
      let q;
      questionsCollections.forEach((qCollection) => {
        q = qCollection.data();
        q.id = qCollection.id;
        q.createAt = q.createAt.toDate().toISOString();
        questions.push(q);
      });

      return res.json(questions);
    })
    .catch((e) => res.json(e.message));
};

exports.getNext20QuestionsByTopic = async (req, res) => {
  let startAfter = req.params.lastQuestionId;
  let topic = req.params.topic;

  let last = await db.collection("Question").doc(startAfter).get();

  if (!last.exists) return res.status(400).json({ error: "No such question" });

  db.collection("Question")
    .orderBy("createAt",'desc')
    .where("topic", "==", topic)
    .startAfter(last)
    .limit(20)
    .get()
    .then((query) => {
      let questions = [];
      let question;
      query.docs.forEach((doc) => {
        question = doc.data();
        question.id = doc.id;
        question.createAt = question.createAt.toDate().toISOString();
        questions.push(question);
      });
      return res.json(questions);
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.getMyQuestions = (req, res)=>{
  let userId = req.user.uid;
  db.collection("Question")
  .orderBy("createAt",'desc')
    .where("owner", "==", userId)
    .limit(20)
    .get()
    .then((query) => {
      let questions = [];
      let question;
      query.docs.forEach((doc) => {
        question = doc.data();
        question.id = doc.id;
        question.createAt = question.createAt.toDate().toISOString();
        questions.push(question);
      });
      return res.json(questions);
    })
    .catch((e) => res.status(400).json({ error: e.message }));
}

exports.getNext20MyQuestions = async (req, res) => {
  let startAfter = req.params.lastQuestionId;
  let userId = req.user.uid;

  let last = await db.collection("Question").doc(startAfter).get();

  if (!last.exists) return res.status(400).json({ error: "No such question" });

  db.collection("Question")
  .orderBy("createAt",'desc')
    .where("owner", "==", userId)
    .startAfter(last)
    .limit(20)
    .get()
    .then((query) => {
      let questions = [];
      let question;
      query.docs.forEach((doc) => {
        question = doc.data();
        question.id = doc.id;
        question.createAt = question.createAt.toDate().toISOString();
        questions.push(question);
      });
      return res.json(questions);
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.getQuestion = (req, res) => {
  db.collection("Question")
    .doc(req.params.id)
    .get()
    .then(async (doc) => {
      if (!doc.exists)
        return res.status(400).json({ error: "Question not found" });
      let question = doc.data();
      question.createAt = question.createAt.toDate().toISOString();
      question.id = doc.id;
      let comments = [];
      let commentsCollection = await db
        .collection(`Comment`)
        .where("question", "==", question.id)
        .orderBy("commentAt",'desc')
        .get()
        .catch((e) => {
          throw Error("Some field missing");
        });
      commentsCollection.docs.forEach((cmtDoc) => {
        let comment = cmtDoc.data();
        comment.id = cmtDoc.id;
        comment.commentAt = comment.commentAt.toDate().toISOString();
        comments.push(comment);
      });
      question.comment = comments;

      return res.json(question);
    })
    .catch((e) => res.json(e.message));
};

exports.postQuestion = (req, res) => {
  let detail = req.body;
  let id = req.user.uid;
  if (id == "anonymous")
    return res.status(400).json({ error: "Anonymous user" });

  if (!req.body.question || !req.body.topic)
    return res.status(400).json({ error: "Invalid question" });

  db.collection("Question")
    .add({
      owner: id,
      question: detail.question,
      topic: detail.topic,
      createAt: admin.firestore.Timestamp.fromDate(new Date()),
    })
    .then((result) => {
      res.json({ message: "Post question successfully" });
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.updateQuestion = async (req, res) => {
  let detail = {};

  if (!req.body.question.trim() && !req.body.topic.trim())
    return res.status(400).json({ error: "Invalid question change" });

  detail.question = req.body.question || req.question.question;
  detail.topic = req.body.topic || req.question.topic;

  if (
    detail.question == req.question.question &&
    detail.topic == req.question.topic
  )
    return res.status(400).json({ error: "Details do not change" });

  detail.id = req.params.id;

  db.collection("Question")
    .doc(detail.id)
    .set(
      {
        question: detail.question,
        topic: detail.topic,
      },
      { merge: true }
    )
    .then((result) => res.json({ message: "Update question successfully" }))
    .catch((e) => res.status(400).json({ error: e.message }));
};

exports.deleteQuestion = async (req, res) => {
  let id = req.params.id;
  db.doc(`Question/${id}`)
    .delete()
    .then((_) => {
      db.collection("Comment")
        .where("question", "==", id)
        .get()
        .then(async (collection) => {
          collection.docs.forEach((doc) => {
            db.doc(`Comment/${doc.id}`)
              .delete()
              .catch((e) => res.json({ error: e.message }));
          });
          return res.json({ message: "Delete question successfully" });
        });
    })
    .catch((e) => res.status(400).json({ error: e.message }));
};
