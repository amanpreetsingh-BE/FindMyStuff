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
 * Description : GET user products
 * Level of credential : Private (ADMIN)
 * Method : GET
 */
export default async function handler(req, res) {
  if (
    req.method === "GET" &&
    req.query.authorization === process.env.SS_API_KEY
  ) {
    var QRs = [];
    const email = req.query.user;
    return app
      .firestore()
      .collection("QR")
      .where("email", "==", email)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          QRs.push({ id: doc.id, data: doc.data() });
        });
        res.status(200).json(QRs);
      })
      .catch((err) => {
        res.status(err.statusCode || 500).json(err.message);
      });
  } else {
    res.setHeader("Allow", "GET");
    res.status(405).end("Method Not Allowed");
  }
}
