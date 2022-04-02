import * as admin from "firebase-admin";
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

const serviceAccount = JSON.parse(
  Buffer.from(env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

/*
 * Description : Allow to update informations about the user
 * Level of credential : Private (admin)
 * Method : POST
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const uid = req.body.uid;
      const oob = req.body.oob;
      if (
        oob !=
        crypto
          .createHash("MD5")
          .update(`${req.body.uid}${env.SS_API_KEY}`)
          .digest("hex")
      ) {
        throw new Error("NOT ALLOWED");
      } else {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        /* Check user input server side */
        const re = /^[a-zA-Z]*$/;
        if (firstName == "" && lastName == "") {
          throw new Error("BAD FORMAT");
        } else if (!re.test(firstName) || !re.test(lastName)) {
          throw new Error("BAD FORMAT");
        } else if (firstName.length > 26 || lastName.length > 26) {
          throw new Error("BAD FORMAT");
        } else if (
          (!(firstName == "") && firstName.length < 3) ||
          (!(lastName == "") && lastName.length < 3)
        ) {
          throw new Error("BAD FORMAT");
        } else {
          const userRef = app.firestore().collection("users").doc(uid);

          await userRef.get().then(async (doc) => {
            if (doc.exists) {
              await userRef.update({
                firstName: firstName,
                lastName: lastName,
              });
              res.status(200).json({ success: true });
            } else {
              res.status(200).json({ success: false });
            }
          });
        }
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
