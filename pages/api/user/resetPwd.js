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
 * Description : Allow to change password
 * Level of credential : Public
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.oob ===
      crypto
        .createHash("MD5")
        .update(`${req.body.uid}${env.SS_API_KEY}`)
        .digest("hex")
  ) {
    try {
      if (req.body.newPwd !== req.body.newPwdRepeat) {
        throw new Error("Corrupted data !");
      } else if (
        req.body.newPwd.length < 6 ||
        req.body.newPwdRepeat.length < 6
      ) {
        throw new Error("Corrupted data !");
      }
      await app.auth().updateUser(req.body.uid, {
        password: req.body.newPwd,
      });
      res.status(200).json({ received: true });
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
