/* AES-258 decipher scheme (base64 -> utf8) to get env variables*/
import { encrypted } from "@root/service-account.enc";
const crypto = require("crypto");

var decipher = crypto.createDecipheriv(
  "AES-256-CBC",
  process.env.SERVICE_ENCRYPTION_KEY,
  process.env.SERVICE_ENCRYPTION_IV
);
var decrypted =
  decipher.update(
    Buffer.from(encrypted, "base64").toString("utf-8"),
    "base64",
    "utf8"
  ) + decipher.final("utf8");

const env = JSON.parse(decrypted);

import * as admin from "firebase-admin";
import Stripe from "stripe";

/* Import base64 encoded private key from firebase and initialize firebase */
const serviceAccount = JSON.parse(
  Buffer.from(env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

/*
 * Description : Allow to add a new coupon
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization ===
      crypto.createHash("MD5").update(env.SS_API_KEY).digest("hex")
  ) {
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
