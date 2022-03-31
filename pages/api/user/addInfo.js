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

      /* check user input server side */
      const re = /^[a-zA-Z]*$/;

      if (!re.test(firstName) || !re.test(lastName)) {
        // number and special characters test
        throw new Error("BAD FORMAT");
      } else if (firstName.length > 26 || lastName.length > 26) {
        throw new Error("BAD FORMAT");
      } else if (firstName.length < 3 || lastName.length < 3) {
        throw new Error("BAD FORMAT");
      } else {
        await app.auth().getUser(uid); // check if the user request is legit

        const userDocRef = app.firestore().collection("users").doc(uid);
        const userDoc = await userDocRef.get();
        if (userDoc.exists) {
          if (signMethod == "google" || signMethod == "facebook") {
            // not first time login with fb or google
            await userDocRef.update({
              email: email,
              firstName: firstName,
              lastName: req.body.lastName,
            });
          } else {
            throw new Error("Email user already exists");
          }
        } else {
          // first time login with fb or google or email
          await userDocRef.set({
            email: email,
            firstName: firstName,
            lastName: lastName,
            signMethod: signMethod,
            verifySent: false,
            admin: false,
          });
        }
        res.status(200).json({ received: true });
      }
    } catch (err) {
      console.log(err.message);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
