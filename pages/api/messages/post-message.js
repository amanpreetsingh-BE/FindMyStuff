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
 * Description : Allow to post a timestamped new message in the database from someone
 * Level of credential : Public (CREATE)
 * Method : POST
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const email = req.body.email;
      const fullname = req.body.fullname;
      const message = req.body.message;
      if (!checkClientInput(email, fullname, message)) {
        throw new Error("BAD FORMAT");
      } else {
        const docRef = app.firestore().collection("messages").doc();
        docRef.set({
          email: email,
          fullname: fullname,
          message: message,
          timestamp: admin.firestore.Timestamp.now().seconds,
          replied: false,
          id: docRef.id,
        });
      }
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
    res.status(200).json({ success: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

/* Client-side verifications of user inputs */
function checkClientInput(email, fullname, message) {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  if (
    fullname.length <= 26 &&
    fullname.length >= 3 &&
    emailRegex.test(email) &&
    message.length >= 10 &&
    message.length <= 300
  ) {
    return true;
  } else {
    return false;
  }
}
