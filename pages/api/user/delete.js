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
 * Description : Allow to delete the user
 * Level of credential : Private (admin)
 * Method : POST
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    const uid = req.body.uid;
    const email = req.body.email;
    const oob = req.body.oob;
    try {
      if (md5(`${uid}${process.env.SS_API_KEY}`) != oob) {
        throw new Error("NOT ALLOWED");
      } else {
        await app.auth().deleteUser(uid);

        const userQuerySnap = await app
          .firestore()
          .collection("users")
          .where("email", "==", email)
          .get();
        userQuerySnap.forEach(async (doc) => {
          await doc.ref.delete();
        });

        const userQrQuerySnap = await app
          .firestore()
          .collection("QR")
          .where("email", "==", email)
          .get();
        userQrQuerySnap.forEach(async (doc) => {
          await doc.ref.update({
            activate: false,
            email: "",
            jetons: doc.data().jetons,
            needToGenerate: false,
            pdf: null,
            relais: null,
            timestamp: null,
            trackingNumber: null,
          });
        });

        const userNotifQuerySnap = await app
          .firestore()
          .collection("notifications")
          .where("email", "==", email)
          .get();
        userNotifQuerySnap.forEach(async (doc) => {
          await doc.ref.delete();
        });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

/**/
