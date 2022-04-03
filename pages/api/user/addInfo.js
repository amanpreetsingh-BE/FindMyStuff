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
 * Description : Allow to add informations about the user
 * Level of credential : Private (admin)
 * Method : POST
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const uid = req.body.uid;
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const signMethod = req.body.signMethod;
      const email = req.body.email;
      const locale = req.body.locale;
      /* check user input server side TBD in V2 */

      await app.auth().getUser(uid); // check if the user request is legit

      const userDocRef = app.firestore().collection("users").doc(uid);
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) {
        // first time login with fb or google or email
        await userDocRef.set({
          email: email,
          firstName: firstName,
          lastName: lastName,
          signMethod: signMethod,
          locale: locale,
          verifySent: false,
          admin: false,
        });
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.log(err.message);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
