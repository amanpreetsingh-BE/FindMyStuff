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

const serviceAccount = JSON.parse(
  Buffer.from(env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

export default async function handler(req, res) {
  if (req.method === "GET") {
    var docRef = app.firestore().collection("reloads").doc(`${req.query.id}`);
    await docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          res.status(200).json(doc.data());
        } else {
          res.status(400).json({ received: false });
        }
      })
      .catch((error) => {
        res.status(400).json({ received: false });
      });
  } else {
    res.setHeader("Allow", "GET");
    res.status(405).end("Method Not Allowed");
  }
}
