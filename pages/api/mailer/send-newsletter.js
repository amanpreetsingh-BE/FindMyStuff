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
 * Description : Allow to send newsletter
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization === md5(process.env.SS_API_KEY)
  ) {
    try {
      const axios = require("axios");
      let msg = null;
      let template = null;
      const context = {
        title: req.body.title,
        message: req.body.message,
        fileURL: req.body.fileURL,
        fileName: req.body.fileName,
      };
      if (req.body.fileURL) {
        template = "d-4bcf0603f54b4764b7d0a7f4d40e1c54";
      } else {
        template = "d-7a18a0497f314ed991f183e6a5dbbf69";
      }
      app
        .firestore()
        .collection("users")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach(async (doc) => {
            msg = {
              from: {
                email: "team@findmystuff.io",
                name: "FindMyStuff",
              },
              template_id: template,
              personalizations: [
                {
                  to: [
                    {
                      email: `${doc.data().email}`,
                    },
                  ],
                  dynamic_template_data: context,
                },
              ],
            };

            await axios({
              method: "post",
              url: "https://api.sendgrid.com/v3/mail/send",
              headers: {
                Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
              },
              data: msg,
            });
          });
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
