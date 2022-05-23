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

/* Import stripe secret key */
const stripe = require("stripe")(env.STRIPE_SECRET_KEY);

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
    const locale = req.body.locale;
    const quantity = req.body.quantity;

    const isReload =
      model == "reload" &&
      cat == "reload" &&
      color == "reload" &&
      priceID == "price_1Kiy4CK5KPA8d9OvQzVaAiQD";
    let session;
    try {
      // Create Checkout Sessions from body params.
      if (isReload) {
        session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price: priceID,
              quantity: quantity,
              tax_rates: ["txr_1Kiy3DK5KPA8d9OvTMraCjwK"], // no need to encode, always same in BE
            },
          ],
          mode: "payment",
          success_url: `${req.headers.origin}/${req.body.locale}/success/?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/${req.body.locale}`,
          billing_address_collection: "required",
          metadata: {
            priceID: priceID,
            cat: cat,
            model: model,
            color: color,
            qrID: qrID,
            locale: locale,
            quantity: quantity,
          },
        });
      } else {
        session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price: priceID,
              quantity: 1,
              tax_rates: ["txr_1Kiy3DK5KPA8d9OvTMraCjwK"], // no need to encode, always same in BE
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
          shipping_rates: ["shr_1L2aAwK5KPA8d9OvYaYK9REf"],
          metadata: {
            priceID: priceID,
            cat: cat,
            model: model,
            color: color,
            imgURL: imgURL,
            locale: locale,
          },
        });
      }

      res.status(200).json(session);
    } catch (err) {
      console.log(err.message);
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
