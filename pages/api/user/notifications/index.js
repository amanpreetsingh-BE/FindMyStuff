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
 * Description : GET user notifications
 * Level of credential : Private (ADMIN)
 * Method : GET
 */
export default async function handler(req, res) {
  if (
    req.method === "GET" &&
    req.query.authorization === process.env.SS_API_KEY
  ) {
    var notifications = [];
    const email = req.query.user;
    return app
      .firestore()
      .collection("notifications")
      .where("email", "==", email)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          var i = doc.id;
          var s = doc.data().scan ? doc.data().scan : null;
          var d = doc.data().delivery ? doc.data().delivery : null;
          notifications.push({ id: i, scan: s, delivery: d });
        });
        res.status(200).json(notifications);
      })
      .catch((err) => {
        res.status(err.statusCode || 500).json(err.message);
      });
  } else {
    res.setHeader("Allow", "GET");
    res.status(405).end("Method Not Allowed");
  }
}
