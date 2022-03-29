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
 * Description : Allow to reply to a message signed by FMS
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization === md5(process.env.SS_API_KEY)
  ) {
    try {
      const id = req.body.id;
      let msg = null;

      const template = "d-1f4fb5bdde5842c2877676c26829064a";

      const context = {
        sub: req.body.formTitle,
        fullname: req.body.fullname,
        txt: req.body.formMessage,
      };
      if (req.body.file) {
        const content = `${req.body.file}`.replace(
          "data:application/pdf;base64,",
          ""
        );
        msg = {
          from: {
            email: process.env.MAIL,
            name: "FindMyStuff",
          },
          template_id: template,
          personalizations: [
            {
              to: [
                {
                  email: req.body.modalEmail,
                },
              ],
              dynamic_template_data: context,
            },
          ],
          attachments: [
            {
              content: content,
              filename: `${req.body.fileName}`,
              type: "application/pdf",
              disposition: "attachment",
            },
          ],
        };
      } else {
        msg = {
          from: {
            email: process.env.MAIL,
            name: "FindMyStuff",
          },
          template_id: template,
          personalizations: [
            {
              to: [
                {
                  email: req.body.modalEmail,
                },
              ],
              dynamic_template_data: context,
            },
          ],
        };
      }
      const axios = require("axios");
      await axios({
        method: "post",
        url: "https://api.sendgrid.com/v3/mail/send",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
        data: msg,
      });

      var docRef = app.firestore().collection(`messages`).doc(`${id}`);
      docRef.get().then(async (doc) => {
        if (doc.exists) {
          await docRef.update({
            replied: true,
          });
        } else {
          console.log("No such document!");
        }
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
