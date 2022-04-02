/* AES-258 decipher scheme (base64 -> utf8) to get env variables*/
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
 * Description : Allow to add a new product
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization ===
      crypto.createHash("MD5").update(env.SS_API_KEY).digest("hex")
  ) {
    const type = req.body.type;
    const name = req.body.name;
    const color = req.body.color;
    const colorHex = req.body.colorHex;
    const description = req.body.description;
    const quantity = req.body.quantity;
    const price = req.body.price;
    const imageURL = req.body.imageURL;

    try {
      const product_stripe = await stripe.products.create({
        name: name,
        description: description,
        images: [imageURL],
        tax_code: "txcd_99999999",
      });

      const price_stripe = await stripe.prices.create({
        unit_amount: price * 100,
        currency: "eur",
        product: product_stripe.id,
      });

      const priceID = price_stripe.id;

      if (color) {
        var docRefType = app.firestore().doc(`products/${type}`).set({});
        var docNameRef = app
          .firestore()
          .doc(`products/${type}/id/${name}`)
          .set({});
        var docColorRef = app
          .firestore()
          .doc(`products/${type}/id/${name}/colors/${color}`)
          .set({
            priceID: priceID,
            quantity: parseInt(quantity),
            color: color,
            colorHex: colorHex,
            price: price,
            status: quantity > 0 ? "In stock" : "Out of stock",
            description: description,
            imageURL: imageURL,
          });
      } else {
        var docRefType = app.firestore().doc(`products/${type}`).set({});
        var docNameRef = app
          .firestore()
          .doc(`products/${type}/id/${name}`)
          .set({
            priceID: priceID,
            quantity: parseInt(quantity),
            color: color,
            colorHex: colorHex,
            price: price,
            status: quantity > 0 ? "In stock" : "Out of stock",
            description: description,
            imageURL: imageURL,
          });
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
