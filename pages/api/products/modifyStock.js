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
 * Description : Allow to change the stock of a new product (add or remove)
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization ===
      crypto.createHash("MD5").update(env.SS_API_KEY).digest("hex")
  ) {
    const category = req.body.category;
    const id = req.body.id;
    const color = req.body.color;
    const increment = req.body.increment;
    try {
      let docRef;
      if (color) {
        docRef = app
          .firestore()
          .collection(`products/${category}/id/${id}/colors/`)
          .doc(`${color}`);
      } else {
        docRef = app
          .firestore()
          .collection(`products/${category}/id/`)
          .doc(`${id}`);
      }

      docRef.get().then((doc) => {
        if (doc.exists) {
          docRef.update({
            quantity: doc.data().quantity + parseInt(increment),
            status:
              doc.data().quantity + parseInt(increment) > 0
                ? "In stock"
                : "Out of stock",
          });
        } else {
          console.log("No such document!");
        }
      });
    } catch (err) {
      res.status(400).json({ received: false });
    }
    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
