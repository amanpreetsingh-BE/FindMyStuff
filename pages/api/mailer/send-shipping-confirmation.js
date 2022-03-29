import * as admin from "firebase-admin";
const md5 = require("md5"); // used to check oob
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
 * Description : Allow to send shipping confiration to the customer
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization === md5(process.env.SS_API_KEY)
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
            email: process.env.MAIL,
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
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
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
