import * as admin from "firebase-admin";
import Stripe from "stripe";

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
 * Description : Allow to remove a coupon
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    const promoID = req.body.promoID;
    const couponID = req.body.couponID;

    try {
      await stripe.coupons.del(couponID);

      await app.firestore().collection("coupons").doc(promoID).delete();
    } catch (err) {
      console.log(err);
      res.status(400).json({ err: err.message });
    }
    res.json({ success: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
