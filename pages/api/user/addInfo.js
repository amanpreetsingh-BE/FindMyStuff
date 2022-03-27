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
 * Description : Allow to add informations about the user
 * Level of credential : Private (admin)
 * Method : POST
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const uid = req.body.uid;
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const signMethod = req.body.signMethod;
      const email = req.body.email;

      await app.auth().getUser(uid); // check if the user is legit

      const userDocRef = app.firestore().collection("users").doc(uid);
      const userDoc = await userDocRef.get();
      if (userDoc.exists) {
        if (signMethod == "google" || signMethod == "facebook") {
          // not first time login with fb or google
          userDocRef.update({
            email: email,
            firstName: firstName,
            lastName: req.body.lastName,
          });
        } else {
          throw new Error("Email user already exists");
        }
      } else {
        // first time login with fb or google or email
        userDocRef.set({
          email: email,
          firstName: firstName,
          lastName: lastName,
          signMethod: signMethod,
          verifySent: false,
          admin: false,
        });
      }
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
