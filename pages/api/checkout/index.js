/* Import stripe secret key */
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/*
 * Description : Allow to create a new checkout session from STRIPE with a private key
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    const priceID = req.body.priceID;
    const model = req.body.model;
    const cat = req.body.cat;
    const color = req.body.color;
    const qrID = req.body.qrID;
    const imgURL = req.body.imgURL;
    const isReload =
      model == "reload" &&
      cat == "reload" &&
      color == "reload" &&
      priceID == "price_1KZcrlK5KPA8d9OvKtznbNWq";
    let session;
    try {
      // Create Checkout Sessions from body params.
      if (isReload) {
        session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price: priceID,
              quantity: 1,
              tax_rates: ["txr_1KBLtIK5KPA8d9OvylyxPlOz"], // no need to encode, always same in BE
            },
          ],
          mode: "payment",
          success_url: `${req.headers.origin}/${req.body.locale}/reloaded/?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/${req.body.locale}`,
          billing_address_collection: "required",
          metadata: {
            priceID: priceID,
            cat: cat,
            model: model,
            color: color,
            qrID: qrID,
          },
        });
      } else {
        session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price: priceID,
              quantity: 1,
              tax_rates: ["txr_1KBLtIK5KPA8d9OvylyxPlOz"], // no need to encode, always same in BE
            },
          ],
          mode: "payment",
          success_url: `${req.headers.origin}/${req.body.locale}/success/?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/${req.body.locale}`,
          allow_promotion_codes: true,
          billing_address_collection: "required",
          shipping_address_collection: {
            allowed_countries: ["BE"],
          },
          metadata: {
            priceID: priceID,
            cat: cat,
            model: model,
            color: color,
            imgURL: imgURL,
          },
        });
      }

      res.status(200).json(session);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
