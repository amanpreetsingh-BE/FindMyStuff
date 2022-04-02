/* AES-258 decipher scheme (base64 -> utf8) to get env variables*/
import { encrypted } from "@root/service-account.enc";
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
 * Description : Allow to make a user admin
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization ===
      crypto.createHash("MD5").update(env.SS_API_KEY).digest("hex")
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
