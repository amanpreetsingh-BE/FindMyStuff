const md5 = require("md5"); // used to make the oob
import * as admin from "firebase-admin";

const serviceAccount = JSON.parse(
  Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

/* return a JSON of products */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    md5(`${req.body.uid}${process.env.SS_API_KEY}`) === req.body.oob
  ) {
    const email = req.body.email;
    try {
      const querySnapshot = await app
        .firestore()
        .collection("notifications")
        .where("email", "==", email)
        .get();

      querySnapshot.forEach((doc) => {
        doc.ref.update({
          scan: [],
          delivery: [],
        });

        res.status(200).json({ success: true });
      });
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
