import * as admin from "firebase-admin";
const md5 = require("md5"); // used to check oob

const serviceAccount = JSON.parse(
  Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

/*
 * Description : Allow to update informations about the user
 * Level of credential : Private (admin)
 * Method : POST
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const uid = req.body.uid;
      const oob = req.body.oob;
      if (md5(`${uid}${process.env.SS_API_KEY}`) != oob) {
        throw new Error("NOT ALLOWED");
      } else {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        /* Check user input server side */
        const re = /^[a-zA-Z]*$/;
        if (firstName == "" && lastName == "") {
          throw new Error("BAD FORMAT");
        } else if (!re.test(firstName) || !re.test(lastName)) {
          throw new Error("BAD FORMAT");
        } else if (firstName.length > 26 || lastName.length > 26) {
          throw new Error("BAD FORMAT");
        } else if (
          (!(firstName == "") && firstName.length < 3) ||
          (!(lastName == "") && lastName.length < 3)
        ) {
          throw new Error("BAD FORMAT");
        } else {
          const userRef = app.firestore().collection("users").doc(uid);

          await userRef.get().then(async (doc) => {
            if (doc.exists) {
              await userRef.update({
                firstName: firstName,
                lastName: lastName,
              });
              res.status(200).json({ success: true });
            } else {
              res.status(200).json({ success: false });
            }
          });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
