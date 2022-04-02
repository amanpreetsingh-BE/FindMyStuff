/* AES-258 decipher scheme (base64 -> utf8) to get env variables*/
const crypto = require("crypto");

var decipher = crypto.createDecipheriv(
  "AES-256-CBC",
  process.env.SERVICE_ENCRYPTION_KEY,
  process.env.SERVICE_ENCRYPTION_IV
);
var decrypted =
  decipher.update(
    Buffer.from(encrypted, "base64").toString("utf-8"),
    "base64",
    "utf8"
  ) + decipher.final("utf8");

const env = JSON.parse(decrypted);

import * as admin from "firebase-admin";

/* Import base64 encoded private key from firebase and initialize firebase */

const serviceAccount = JSON.parse(
  Buffer.from(env.SECRET_SERVICE_ACCOUNT, "base64")
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
    req.body.authorization ===
      crypto.createHash("MD5").update(env.SS_API_KEY).digest("hex")
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
