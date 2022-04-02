import Stripe from "stripe";
import { buffer } from "micro";
import * as admin from "firebase-admin";
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

/* Import base64 encoded private key from firebase and initialize firebase */
const serviceAccount = JSON.parse(
  Buffer.from(env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

const stripe = new Stripe(env.STRIPE_SECRET_KEY); // import stripe secret key
const orderid = require("order-id")("key"); // generator of order-id based on timestamp

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

var global_COUPON = null;

/* Function allowing to increment the usage of a specific coupon if checkout success */
const increaseCouponUsage = async () => {
  let docRef = app.firestore().collection("coupons").doc(`${global_COUPON}`);

  await docRef.get().then((doc) => {
    if (doc.exists) {
      docRef.update({
        usage: doc.data().usage + 1,
      });
    } else {
      console.log("No such document!");
    }
  });
};

/* Function allowing to increment the number of delivery of a specific QR */
const incrementToken = async (qrID, qty) => {
  let docRef = app.firestore().collection("QR").doc(`${qrID}`);

  await docRef.get().then((doc) => {
    if (doc.exists) {
      docRef.update({
        jetons: doc.data().jetons + parseInt(qty),
      });
    } else {
      console.log("No such document!");
    }
  });
};

/* Function allowing to decrement the stock of the checkout product */
const decrementStock = async (session) => {
  let docRef;
  if (session.metadata.color) {
    // if color attribute of the product
    docRef = app
      .firestore()
      .collection("products")
      .doc(`${session.metadata.cat}`)
      .collection("id")
      .doc(`${session.metadata.model}`)
      .collection("colors")
      .doc(`${session.metadata.color}`);
  } else {
    docRef = app
      .firestore()
      .collection("products")
      .doc(`${session.metadata.cat}`)
      .collection("id")
      .doc(`${session.metadata.model}`);
  }

  await docRef.get().then((doc) => {
    if (doc.exists) {
      docRef.update({
        quantity: doc.data().quantity == 0 ? 0 : doc.data().quantity - 1,
        status: doc.data().quantity - 1 > 0 ? "In stock" : "Out of stock",
      });
    } else {
      console.log("No such document!");
    }
  });
};

/* Add ORDER to the DB */
const fulfillOrder = async (session, charge, paymentType, amount) => {
  const order_id = orderid.generate();
  // Reload QR type of checkout
  if (
    session.metadata.model == "reload" &&
    session.metadata.cat == "reload" &&
    session.metadata.color == "reload" &&
    session.metadata.priceID == "price_1KZcrlK5KPA8d9OvKtznbNWq"
  ) {
    await incrementToken(session.metadata.qrID, session.metadata.quantity);
    await app
      .firestore()
      .collection("reloads")
      .doc(session.id)
      .set({
        stripe_priceID: session.metadata.priceID,
        stripe_checkoutID: session.id,
        stripe_customerID: session.customer,
        stripe_paymentIntentID: session.payment_intent,
        order_id: order_id,
        qrID: session.metadata.qrID,
        paymentType: paymentType,
        quantity: `${session.metadata.quantity}`,
        model: `${session.metadata.model}`,
        color: `${session.metadata.color ? session.metadata.color : "none"}`,
        customer_email: session.customer_details.email,
        charge: charge,
        emailSent: false,
        timestamp: admin.firestore.Timestamp.now().seconds,
        locale: `${session.metadata.locale}`,
      });
  } else {
    // Product type of checkout
    if (global_COUPON) {
      await increaseCouponUsage();
    }
    await decrementStock(session);
    await app
      .firestore()
      .collection("orders")
      .doc(session.id)
      .set({
        stripe_priceID: session.metadata.priceID,
        stripe_checkoutID: session.id,
        stripe_customerID: session.customer,
        stripe_paymentIntentID: session.payment_intent,
        order_id: order_id,
        paymentType: paymentType,
        amount: amount,
        model: `${session.metadata.model}`,
        color: `${session.metadata.color ? session.metadata.color : "none"}`,
        customer_email: session.customer_details.email,
        shipping_name: session.shipping.name,
        shipping_address: session.shipping.address,
        charge: charge,
        emailSent: false,
        timestamp: admin.firestore.Timestamp.now().seconds,
        shipped: false,
        total_details: session.total_details,
        allow_promotion_codes: session.allow_promotion_codes,
        promotion_code: global_COUPON,
        imgURL: `${session.metadata.imgURL}`,
        locale: `${session.metadata.locale}`,
      });
  }
};

/*
 * Description : Webhook listening to events for the checkout session
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    let event;

    try {
      const rawBody = await buffer(req);
      const signature = req.headers["stripe-signature"];

      event = stripe.webhooks.constructEvent(
        rawBody.toString(),
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === "customer.discount.created") {
        global_COUPON = event.data.object.promotion_code; // set promo code if applied at checkout
      } else if (event.type === "promotion.code.updated") {
        global_COUPON = event.data.object.promotion_code; // set promo code if applied at checkout
      } else if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent
        );
        const paymentMethod = await stripe.paymentMethods.retrieve(
          paymentIntent.payment_method
        );
        await fulfillOrder(
          session,
          paymentIntent.charges.data[0],
          paymentMethod.type,
          paymentIntent.amount
        );
      } else if (event.type === "payment_intent.payment_failed") {
        console.log("failed"); // to add notif system in V2
      } else {
        console.log(`Unhandled event : ${event.type}`); // to debug
      }
    } catch (err) {
      console.log(err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
    res.status(200).json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
