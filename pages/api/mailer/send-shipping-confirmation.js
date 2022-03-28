import * as admin from "firebase-admin";

const serviceAccount = JSON.parse(
  Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const id = req.body.id;
    try {
      var docRef = app.firestore().collection(`orders`).doc(`${id}`);
      docRef.get().then(async (doc) => {
        if (doc.exists) {
          docRef.update({
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
          axios({
            method: "post",
            url: "https://api.sendgrid.com/v3/mail/send",
            headers: {
              Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            },
            data: msg,
          });
          res.status(200).json({ received: true });
        } else {
          res.status(400).json({ received: false });
          console.log("No such document!");
        }
      });
    } catch (err) {
      res.status(400).json({ received: false });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
