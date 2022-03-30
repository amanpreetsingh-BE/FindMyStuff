import * as admin from "firebase-admin";
const md5 = require("md5");

/* Import base64 encoded private key from firebase and initialize firebase */
const serviceAccount = JSON.parse(
  Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
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
    md5(`${req.body.id}${process.env.SS_API_KEY}`) === req.body.oob
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
        console.log("notifying ...");
        var hbs = require("nodemailer-express-handlebars");
        var nodemailer = require("nodemailer");
        const path = require("path");

        const transporter = nodemailer.createTransport({
          host: process.env.HOSTMAIL,
          port: 465,
          secure: true, // true for 465, false for other ports
          auth: {
            user: process.env.MAIL,
            pass: process.env.SECRET_MAIL,
          },
        });

        const options = {
          viewEngine: {
            extName: ".html",
            partialsDir: path.resolve("templates"),
            defaultLayout: false,
          },
          viewPath: path.resolve("templates"),
          extName: ".handlebars",
        };

        transporter.use("compile", hbs(options));
        const mail = {
          from: process.env.MAIL,
          to: process.env.MAIL,
          subject: `${id} NEEDS QR GENERATION !`,
          template: "notifyGenerate",
          context: {
            id: id,
            email: qrData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            relaisName: qrData.relais.heading,
            relaisNum: qrData.relais.num,
            relaisStreet: qrData.relais.street,
            relaisCP: qrData.relais.code,
          },
        };
        await transporter.sendMail(mail);
        const qrRef = app.firestore().collection("QR").doc(id);
        await qrRef.update({
          needToGenerate: true,
        });
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
