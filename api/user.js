const { json } = require("body-parser");
const { db, admin, storage, firebase } = require("../util/admin");
// const fbAuth = require("../util/fbAuth");

exports.signUpWithEmail = (req, res) => {
  let data = req.body;
  let newUser = {
    email: data.email,
    password: data.password,
    userName: data.userName,
  };

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(async (userCredential) => {
      // Signed in
      var user = userCredential.user;
      user.sendEmailVerification();
      await db.collection("User").doc(user.uid).set(
        {
          email: newUser.email,
          userName: newUser.userName,
          gender: "Other",
          birth: "",
          avatar: "",
          coverImage: "",
          bio: "",
          friend: [],
          topic: [],
          createAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return res.status(201).json({ message: "Sign up successfully" });
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      return res.status(400).json({ error: errorMessage });
      // ..
    });
};

exports.signInWithEmail = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      let user = userCredential.user;
      if (user.emailVerified) {
        userCredential.user.getIdToken(false).then((token) => {
          return res.status(200).json({ token });
        });
      } else throw new Error("Email is not verified");
    })
    .catch((e) => {
      return res.status(401).json({ error: e.message });
    });
};

exports.updateAvatar = (req, res) => {
  // storage.
};

exports.updateProfile = (req, res) => {
  let userDetail = req.body;
  userDetail.id = req.user.uid;
  if (userDetail.id == "anonymous")
    return res.status(400).json({ error: "Anonymous user" });
  db.doc(`User/${userDetail.id}`)
    .set(
      {
        //   email: userDetail.email,
        userName: userDetail.userName,
        gender: userDetail.gender,
        birth: userDetail.birth,
        avatar: userDetail.avatar,
        coverImage: userDetail.coverImage,
        bio: userDetail.bio,
        friend: userDetail.friend,
        topic: userDetail.topic,
      },
      { merge: true }
    )
    .then((_) => {
      return res.json({ message: "Update successfully" });
    })
    .catch((e) => {
      return res.status(400).json({ error: e.message });
    });
};

// const getFileUrl = async (path) => {
//   if (!path) throw Error();
//   let file = storage.file(path);
//   let isExist = await file.exists();
//   if (!isExist[0]) throw Error("Not found");

//   await file
//     .getSignedUrl({
//       action: "read",
//       expires: Date.now() + 1000 * 60 * 60,
//     })
//     .then((val) => (path = val));
//   return path;
// };

exports.profile = (req, res) => {
  let id = req.params.id;
  let avatarUrl = `https://firebasestorage.googleapis.com/v0/b/hoidap-824bb.appspot.com/o/User%2F8jSppc10mmeCNVRKsSx7sKtlEch1-avatar.png?alt=media&token=8jSppc10mmeCNVRKsSx7sKtlEch1`;

  let coverUrl = `https://firebasestorage.googleapis.com/v0/b/hoidap-824bb.appspot.com/o/User%2F8jSppc10mmeCNVRKsSx7sKtlEch1-coverImage.png?alt=media&token=8jSppc10mmeCNVRKsSx7sKtlEch1 `;

  db.doc(`User/${id}`)
    .get()
    .then(async (data) => {
      let user = data.data();

      // await getFileUrl(user.avatar)
      //   .then((val) => (avatarUrl = val))
      //   .catch((e) => (avatarUrl = ""));

      // await getFileUrl(user.coverImage)
      //   .then((val) => (coverUrl = val))
      //   .catch((e) => (coverUrl = ""));

      user.avatar = avatarUrl;
      user.coverImage = coverUrl;
      user.id = data.id;
      return res.json(user);
    })
    .catch((e) => {
      return res.status(404).json({ error: e.message });
    });
};

// exports.change = (req, res) => {
//   let file = storage.file("User/8jSppc10mmeCNVRKsSx7sKtlEch1-coverImage.png");
//   file
//     .setMetadata({
//       metadata: {
//         firebaseStorageDownloadTokens: "8jSppc10mmeCNVRKsSx7sKtlEch1",
//       },
//     })
//     .then((val) => res.json("OK"))
//     .catch((e) => {
//       res.json({ e });
//     });
// file
//   .getMetadata()
//   .then((val) => res.json(val))
//   .catch((e) => res.json({ e }));
// };

("https://firebasestorage.googleapis.com/v0/b/hoidap-824bb.appspot.com/o/User%2F8jSppc10mmeCNVRKsSx7sKtlEch1-avatar.png?alt=media&token=8jSppc10mmeCNVRKsSx7sKtlEch1");
