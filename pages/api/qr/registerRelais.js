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
const serviceAccount = JSON.parse(
  Buffer.from(env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.oob ===
      crypto
        .createHash("MD5")
        .update(`${req.body.id}${env.SS_API_KEY}`)
        .digest("hex")
  ) {
    const id = req.body.id;
    const selection = req.body.selection;
    try {
      const qrRef = app.firestore().collection("QR").doc(id);

      const doc = await qrRef.get();
      if (doc.exists) {
        qrRef.update({
          relais: selection,
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
