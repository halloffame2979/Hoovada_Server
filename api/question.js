const { db, admin, storage, firebase } = require("../util/admin");
const { getOneQuestionTemp } = require('../method/getOneQuesionTemp');
const { getQuestionsTemp } = require('../method/getQuestionsTemp');

exports.getQuestions = async (req, res) => {
  let lastDocId = req.params.lastDocId;
  if (!lastDocId) {
    db.collection("Question")
      .orderBy("createAt", "desc")
      .limit(20)
      .get()
      .then(async (query) => {
        getQuestionsTemp(query)
          .then((data) => res.json(data))
          .catch((e) => {
            console.log(e);
            res.status(400).json({ error: e });
          });
      })
      .catch((e) => res.json(e.message));
  } else {
    let lastDoc = await db.doc(`Question/${lastDocId}`).get();
    if (!lastDoc.exists)
      return res.status(400).json({ error: "No question ID" });
    db.collection("Question")
      .orderBy("createAt", "desc")
      .startAfter(lastDoc)
      .limit(20)
      .get()
      .then(async (query) => {
        getQuestionsTemp(query)
          .then((data) => res.json(data))
          .catch((e) => res.status(400).json({ error: e }));
      })
      .catch((e) => res.json(e.message));
  }
};

exports.getQuestionsByTopic = async (req, res) => {
  let topic = req.params.topic;
  let lastDocId = req.params.lastDocId;
  if (!lastDocId) {
    db.collection("Question")
      .orderBy("createAt", "desc")
      .where("topic", "=", topic)
      .limit(20)
      .get()
      .then(async (query) => {
        getQuestionsTemp(query)
          .then((data) => res.json(data))
          .catch((e) => res.status(400).json({ error: e }));
      })
      .catch((e) => res.json(e.message));
  } else {
    let lastDoc = await db.doc(`Question/${lastDocId}`).get();
    if (!lastDoc.exists)
      return res.status(400).json({ error: "No question ID" });
    db.collection("Question")
      .orderBy("createAt", "desc")
      .where("topic", "=", topic)
      .startAfter(lastDoc)
      .limit(20)
      .get()
      .then((query) => {
        getQuestionsTemp(query)
          .then((data) => res.json(data))
          .catch((e) => res.status(400).json({ error: e }));
      })
      .catch((e) => res.json(e.message));
  }
};

exports.getQuestionsByUserId = async (req, res) => {
  let userId = req.params.userId;
  let lastDocId = req.params.lastDocId;
  if (!lastDocId) {
    db.collection("Question")
      .orderBy("createAt", "desc")
      .where("owner", "==", userId)
      .limit(20)
      .get()
      .then((query) => {
        getQuestionsTemp(query)
          .then((data) => res.json(data))
          .catch((e) => res.status(400).json({ error: e }));
      })
      .catch((e) => res.status(400).json({ error: e.message }));
  } else {
    let lastDoc = await db.doc(`Question/${lastDocId}`).get();
    if (!lastDoc.exists)
      return res.status(400).json({ error: "No question ID" });
    db.collection("Question")
      .orderBy("createAt", "desc")
      .startAfter(lastDoc)
      .where("owner", "==", userId)
      .limit(20)
      .get()
      .then((query) => {
        getQuestionsTemp(query)
          .then((data) => res.json(data))
          .catch((e) => res.status(400).json({ error: e }));
      })
      .catch((e) => res.status(400).json({ error: e.message }));
  }
};

exports.getQuestion = (req, res) => {
  db.collection("Question")
    .doc(req.params.id)
    .get()
    .then(async (doc) => {
      
      let question = await getOneQuestionTemp(doc);
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
