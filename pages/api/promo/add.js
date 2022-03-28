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
 * Description : Allow to add a new coupon
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    const code = req.body.code;
    const percent = req.body.percent;

    try {
      const coupon = await stripe.coupons.create({
        percent_off: percent,
        currency: "eur",
      });

      const promotionCode = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code: code,
      });

      app.firestore().collection("coupons").doc(promotionCode.id).set({
        promotionCode: promotionCode,
        usage: 0,
      });
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
