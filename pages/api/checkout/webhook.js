import Stripe from 'stripe'
import { buffer } from 'micro'
import * as admin from 'firebase-admin'

const orderid = require('order-id')('key');

const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
}) : admin.app()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  },
};

const decrementStock = async (session) => {
  let docRef 
  if(session.metadata.color) {
    docRef = app
    .firestore()
    .collection("products")
    .doc(`${session.metadata.cat}`)
    .collection('id')
    .doc(`${session.metadata.model}`)
    .collection('colors')
    .doc(`${session.metadata.color}`)
  } else {
    docRef = app
    .firestore()
    .collection("products")
    .doc(`${session.metadata.cat}`)
    .collection('id')
    .doc(`${session.metadata.model}`)
  }

  return docRef.get().then((doc) => {
    if (doc.exists) {
      docRef.update({
        quantity: doc.data().quantity-1,
        status: (doc.data().quantity-1 > 0) ? "In stock" : "Out of stock"
      })
    } else {
      console.log("No such document!");
    }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });
}


const fulfillOrder = async (session, charge, paymentType, amount) => {

  decrementStock(session)
  const order_id = orderid.generate()
  return app
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
      color: `${session.metadata.color ? session.metadata.color:"none"}`,
      customer_email: session.customer_details.email,
      shipping_name: session.shipping.name,
      shipping_address: session.shipping.address,
      charge: charge,
      emailSent: false,
      emailID: '',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      shipped: false
    })
    .catch((err) =>{
      console.log(err.message)
    })
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let event;

    try {
      // 1. Retrieve the event by verifying the signature using the raw body and secret
      const rawBody = await buffer(req);
      const signature = req.headers['stripe-signature'];

      event = stripe.webhooks.constructEvent(
        rawBody.toString(),
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`❌ Error message: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    
    // Successfully constructed event
    console.log('✅ Success:', event.id);

    // 2. Handle event type (add business logic here)
    if (event.type === 'checkout.session.completed') {
      console.log(`💰  Payment received!`);
      const session = event.data.object
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
      return fulfillOrder(session, paymentIntent.charges.data[0], paymentMethod.type, paymentIntent.amount)
        .then(() => res.status(200))
        .catch((err) => res.status(400).send(`Webhook Error: ${err.message}`))
    } else if(event.type === 'payment_intent.payment_failed' || event.type === 'charge.failed'){
      console.log(`💰  Payment failed !`);
    } else {
      console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
    }

    // 3. Return a response to acknowledge receipt of the event.
    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}