const { db, admin } = require("./util/admin");
const fs = require("fs");


// db.collection('Comment').get().then(data=>{
//     let users = data.docs.map(val=>{
//         let x = val.data();
//         x.id = val.id;
//         return x
//     });
//     fs.writeFile('comment.json',JSON.stringify({user:users}),e=>{
//         console.log(e);
//     });
// })
// var data = fs.readFileSync("./result.json");
// var json = JSON.parse(data);
// var questionList = json.question;

// questionList.forEach(async (question, questionIndex) => {
//   let userQuestion =
//     questionIndex % 2 == 0
//       ? "8jSppc10mmeCNVRKsSx7sKtlEch1"
//       : "cluHZaxJkebHc93agUgLnKve0TE2";
//   let check = (
//     await db
//       .collection("Question")
//       .where("question", "==", question.question)
//       .get()
//   ).docs.length;
//   if (check == 0) {
//     db.collection("Question")
//       .add({
//         createAt: admin.firestore.Timestamp.fromDate(new Date()),
//         owner: userQuestion,
//         topic: ["Lập trình"],
//         question: question.question,
//       })
//       .then((doc) => {
//         let questionId = doc.id;
//         let answerList = question.answer;
//         let userAnswer =
//           questionIndex % 2 == 1
//             ? "8jSppc10mmeCNVRKsSx7sKtlEch1"
//             : "cluHZaxJkebHc93agUgLnKve0TE2";
//         answerList.forEach(async (answer, answerIndex) => {
//           let aCheck = (
//             await db
//               .collection("Comment")
//               .where("detail", "==", answer.aDetail)
//               .get()
//           ).docs.length;
//           if (aCheck == 0) {
//             let vote = parseInt(answer.vote);
//             let like = Array(vote).fill("anonymous");
//             db.collection("Comment").add({
//               commentAt: admin.firestore.Timestamp.fromDate(new Date()),
//               detail: answer.aDetail,
//               like: like,
//               dislike: [],
//               owner: userAnswer,
//               question: questionId,
//             });
//           }
//         });
//       });
//   }
// });

// // questionList.forEach((q, qI) => {
// //   let aL = q.answer;
// //   aL.forEach((a, aI) => {
// //     let vote = parseInt(a.vote);
// //     console.log(vote);
// //   });
// // });

// //8jSppc10mmeCNVRKsSx7sKtlEch1 khong Vu Huy
// //cluHZaxJkebHc93agUgLnKve0TE2 ome Yasuo
