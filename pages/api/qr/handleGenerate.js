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

/*
 * Description : Allow to activate a QR code (link email to QR)
 * Level of credential : Private
 * Method : POST
 */
const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.oob ===
      crypto
        .createHash("MD5")
        .update(`${req.body.id}${env.SS_API_KEY}`)
        .digest("hex") // sanity check
  ) {
    const fullName = req.body.fullName;
    const iban = req.body.iban;
    const expire = req.body.expire;
    const timestamp = req.body.timestamp;
    const id = req.body.id;
    const donation = req.body.donation;

    try {
      /* Check user input server side TBD */

      /* RETRIEVE QR DATA */
      const qrData = (
        await app.firestore().collection("QR").doc(id).get()
      ).data();
      console.log(qrData);
      /* RETRIEVE OWNER OF QR DATA */
      const queryQrToOwner = await app
        .firestore()
        .collection("users")
        .where("email", "==", qrData.email)
        .get();
      var userData = null;
      queryQrToOwner.forEach((doc) => {
        userData = doc.data();
      });
      console.log(userData);

      /* SET/UPDATE A FINDER */
      const finderRef = app.firestore().collection("finders").doc(id);
      const finderDOC = await finderRef.get();

      if (finderDOC.exists) {
        await finderRef.update({
          fullName: fullName,
          iban: iban,
          donation: donation,
          id: finderDOC.id,
          ownerFirstName: userData.firstName,
          ownerLastName: userData.lastName,
          relaisNum: qrData.relais.num,
          relaisHeading: qrData.relais.heading,
        });
      } else {
        await finderRef.set({
          fullName: fullName,
          iban: iban,
          donation: donation,
          id: finderDOC.id,
          ownerFirstName: userData.firstName,
          ownerLastName: userData.lastName,
          relaisNum: qrData.relais.num,
          relaisHeading: qrData.relais.heading,
        });
      }

      /* NOTIFY IF NEED TO GENERATE */
      if (!timestamp || expire) {
        const axios = require("axios");
        const template = "d-b0603edea6a142bf918b63edf691681b";
        const context = {
          id: id,
          email: qrData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          relaisName: qrData.relais.heading,
          relaisNum: qrData.relais.num,
          relaisStreet: qrData.relais.street,
          relaisCP: qrData.relais.code,
        };
        const msg = {
          from: {
            email: env.MAIL,
            name: "FindMyStuff",
          },
          template_id: template,
          personalizations: [
            {
              to: [
                {
                  email: env.MAIL,
                },
              ],
              dynamic_template_data: context,
            },
          ],
        };

        try {
          await axios({
            method: "post",
            url: "https://api.sendgrid.com/v3/mail/send",
            headers: {
              Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
            },
            data: msg,
          });
          const qrRef = app.firestore().collection("QR").doc(id);
          await qrRef.update({
            needToGenerate: true,
          });
        } catch (err) {
          console.log(err.message); // server debug
        }
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.log(err.message);
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
