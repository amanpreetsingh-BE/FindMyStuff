const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/*
 * Description : Allow to get information about the checkout session with an ID
 * Level of credential : Public
 * Method : GET
 */
export default async function handler(req, res) {
  if (req.method === "GET") {
    const id = req.query.id;
    try {
      if (!id.startsWith("cs_")) {
        throw Error("Incorrect CheckoutSession ID.");
      }
      const checkout_session = await stripe.checkout.sessions.retrieve(id);
      res.status(200).json(checkout_session);
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader("Allow", "GET");
    res.status(405).end("Method Not Allowed");
  }
}
