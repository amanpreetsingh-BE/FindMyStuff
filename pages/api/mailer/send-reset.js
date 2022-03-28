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
  if (req.method === "POST") {
    try {
      const template =
        req.body.locale ===
        ("fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr")
          ? "d-f2562388cc544a86b4de9addd67530a4"
          : "d-1554c9aa9a7645daad25d71c043844bc";
      const user = await app.auth().getUserByEmail(req.body.email);
      let uid = user.uid;
      let firstName = null;
      let lastName = null;
      let signMethod = null;
      const oob = md5(`${uid}${process.env.SS_API_KEY}`);
      const query = app
        .firestore()
        .collection("users")
        .where("email", "==", req.body.email);
      const querySnapshot = await query.get();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        firstName = data.firstName;
        lastName = data.lastName;
        signMethod = data.signMethod;
      });

      if (signMethod != "email") {
        throw new Error("Signed with facebook or google");
      }

      const context = {
        url: `${req.body.hostname}/${req.body.locale}/resetPwd?oob=${oob}&uid=${uid}`,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
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
      console.log(template);
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
    } catch (err) {
      console.log(err.message);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
