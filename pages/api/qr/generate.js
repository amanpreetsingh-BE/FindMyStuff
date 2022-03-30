import * as admin from "firebase-admin";
const md5 = require("md5");

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
 * Description : Allow to generate a PDF for delivery and update in DB
 * Level of credential : Private (CREATE)
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization == md5(process.env.SS_API_KEY)
  ) {
    try {
      const id = req.body.id;
      const pdf = req.body.pdf;
      const trackingNumber = req.body.trackingNumber;
      const qrRef = app.firestore().collection("QR").doc(id);
      const finderRef = app.firestore().collection("finders").doc(id);
      await finderRef.update({
        trackingNumber: trackingNumber,
      });

      await qrRef.update({
        timestamp: admin.firestore.Timestamp.now().seconds,
        pdf: pdf,
        needToGenerate: false,
        trackingNumber: trackingNumber,
      });
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
