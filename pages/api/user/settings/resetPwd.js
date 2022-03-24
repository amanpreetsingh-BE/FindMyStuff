const md5 = require("md5"); // used to make the oob

import * as admin from "firebase-admin";

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
 * Description : Allow to send password change by mail
 * Level of credential : Public
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    md5(`${req.body.uid}${process.env.SS_API_KEY}`) === req.body.oob
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
