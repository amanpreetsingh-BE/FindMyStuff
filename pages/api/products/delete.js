import * as admin from "firebase-admin";
import Stripe from "stripe";
const md5 = require("md5"); // used to check oob
/* Import base64 encoded private key from firebase and initialize firebase */
const serviceAccount = JSON.parse(
  Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/*
 * Description : Allow to delete a product
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization === md5(process.env.SS_API_KEY)
  ) {
    const category = req.body.category;
    const id = req.body.id;
    const color = req.body.color;
    const key = req.body.priceID;

    try {
      await stripe.prices.update(key, { active: false });

      if (color) {
        var docNameRef = app.firestore().doc(`products/${category}/id/${id}`);
        app
          .firestore()
          .doc(`products/${category}/id/${id}/colors/${color}`)
          .delete()
          .then(async () => {
            const colorsCollection = await app
              .firestore()
              .collection(`products/${category}/id/${id}/colors/`)
              .get();
            const size = colorsCollection.size;
            if (size == 0) {
              console.log(size);
              docNameRef.delete();
            }
          });
      } else {
        var docNameRef = app
          .firestore()
          .doc(`products/${category}/id/${id}`)
          .delete();
      }
    } catch (err) {
      console.log(err);
      res.status(400).json({ received: false });
    }
    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
