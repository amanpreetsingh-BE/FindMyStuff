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
 * Description : Allow to send shipping confiration to the customer
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization ===
      crypto.createHash("MD5").update(env.SS_API_KEY).digest("hex")
  ) {
    const id = req.body.id;
    try {
      const docRef = app.firestore().collection(`orders`).doc(`${id}`);
      const doc = await docRef.get();

      if (doc.exists) {
        await docRef.update({
          shipped: true,
        });

        const data = doc.data();

        const template =
          req.body.locale ===
          ("fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr")
            ? "d-97dac65f28fc4121896736c86e925c66"
            : "d-6cbf7459412b41a4b92c7b477759f986";
        const context = {
          fullName: data.shipping_name,
          orderNumber: data.order_id,
        };
        const msg = {
          from: {
            email: "team@findmystuff.io",
            name: "FindMyStuff",
          },
          template_id: template,
          personalizations: [
            {
              to: [
                {
                  email: req.body.email,
                },
              ],
              dynamic_template_data: context,
            },
          ],
        };
        const axios = require("axios");
        await axios({
          method: "post",
          url: "https://api.sendgrid.com/v3/mail/send",
          headers: {
            Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
          },
          data: msg,
        });
        res.status(200).json({ received: true });
      } else {
        console.log("No such document!");
        res.status(200).json({ received: false });
      }
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
