import * as admin from "firebase-admin";
import Stripe from "stripe";

const serviceAccount = JSON.parse(
  Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
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
