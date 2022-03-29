import * as admin from "firebase-admin";
const md5 = require("md5"); // used to check oob
/* Import base64 encoded private key from firebase and initialize firebase */
const serviceAccount = JSON.parse(
  Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

/*
 * Description : Allow to make a user admin
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization === md5(process.env.SS_API_KEY)
  ) {
    const email = req.body.email;

    try {
      const user = await app.auth().getUserByEmail(email); // check if legit
      let docRef;

      docRef = app.firestore().collection(`users`).doc(`${user.uid}`);
      doc = await docRef.get();
      if (doc.data().admin) {
        throw new Error("Already admin !");
      } else {
        await docRef.update({
          admin: true,
        });
      }
      res.json({ received: true });
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
