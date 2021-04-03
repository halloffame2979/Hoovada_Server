const admin = require("firebase-admin");
const config = require("../api/config");
const firebase = require("firebase");
var serviceAccount = require("./hoidap-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://hoidap-824bb.appspot.com",
});
firebase.initializeApp(config);
const db = admin.firestore();
const storage = admin.storage().bucket();
db.settings({ ignoreUndefinedProperties: true });
module.exports = { admin, db, storage, firebase };
