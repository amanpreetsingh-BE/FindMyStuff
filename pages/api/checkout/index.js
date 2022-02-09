const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
    if (req.method === 'POST') {
      const priceID = req.body.priceID
      const model = req.body.model
      const cat = req.body.cat
      const color = req.body.color

      try {
        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price: priceID,
              quantity: 1,
              tax_rates: ['txr_1KBLtIK5KPA8d9OvylyxPlOz']
            },
          ],
          mode: 'payment',
          success_url: `${req.headers.origin}/${req.body.locale}/success/?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/${req.body.locale}`,
          allow_promotion_codes: true,
          billing_address_collection: 'required',
          shipping_address_collection: {
              allowed_countries : ['BE']
          },
          metadata:{
            priceID: priceID,
            cat: cat,
            model: model,
            color: color,
          }
        });
        res.status(200).json(session);
      } catch (err) {
        res.status(err.statusCode || 500).json(err.message);
      }
    } else {
      res.setHeader('Allow', 'POST');
      res.status(405).end('Method Not Allowed');
    }
}