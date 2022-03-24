const md5 = require("md5"); // used to check the oob
import * as admin from "firebase-admin";
const serviceAccount = JSON.parse(
  Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    md5(`${req.body.id}${process.env.SS_API_KEY}`) === req.body.oob
  ) {
    const id = req.body.id;
    const email = req.body.email;
    try {
      const qrRef = app.firestore().collection("QR").doc(id);
      const doc = await qrRef.get();
      if (doc.exists) {
        qrRef.update({
          activate: true,
          email: email,
        });
        res.status(200).json({ success: true });
      } else {
        res.status(200).json({ success: false });
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
