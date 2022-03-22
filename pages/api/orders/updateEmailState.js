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
    req.body.authorization == process.env.SS_API_KEY
  ) {
    try {
      var docRef = app.firestore().collection("orders").doc(`${req.body.id}`);

      await docRef.get().then((doc) => {
        if (doc.exists) {
          docRef.update({
            emailSent: true,
            emailINFO: req.body.emailINFO,
            receipt: req.body.base64Invoice,
          });
        } else {
          throw new Error("No order found");
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
