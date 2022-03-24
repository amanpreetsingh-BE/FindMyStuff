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
 * Description : GET messages posted by customers
 * Level of credential : Private (ADMIN)
 * Method : GET
 */
export default async function handler(req, res) {
  if (
    req.method === "GET" &&
    req.query.authorization == process.env.NEXT_PUBLIC_API_KEY
  ) {
    try {
      const messages = [];
      const query = app
        .firestore()
        .collection("messages")
        .orderBy("timestamp", "desc");
      const snapshot = await query.get();

      snapshot.forEach((doc) => {
        messages.push(doc.data());
      });

      res.json(messages);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "GET");
    res.status(405).end("Method Not Allowed");
  }
}
