import * as admin from "firebase-admin";

const serviceAccount = JSON.parse(
  Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const category = req.body.category;
    const id = req.body.id;
    const color = req.body.color;
    const increment = req.body.increment;
    try {
      let docRef;
      if (color) {
        docRef = app
          .firestore()
          .collection(`products/${category}/id/${id}/colors/`)
          .doc(`${color}`);
      } else {
        docRef = app
          .firestore()
          .collection(`products/${category}/id/`)
          .doc(`${id}`);
      }

      docRef.get().then((doc) => {
        if (doc.exists) {
          docRef.update({
            quantity: doc.data().quantity + parseInt(increment),
            status:
              doc.data().quantity + parseInt(increment) > 0
                ? "In stock"
                : "Out of stock",
          });
        } else {
          console.log("No such document!");
        }
      });
    } catch (err) {
      res.status(400).json({ received: false });
    }
    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
