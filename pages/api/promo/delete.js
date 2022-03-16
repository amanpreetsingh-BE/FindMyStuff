import * as admin from 'firebase-admin'
import Stripe from 'stripe'

const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST' && req.body.authorization == process.env.NEXT_PUBLIC_API_KEY) {

        const promoID = req.body.promoID
        const couponID = req.body.couponID
        
        try {
            const deleted = await stripe.coupons.del(
                couponID
            );

            var docRef = app.firestore().collection('coupons').doc(promoID).delete();
            
        } catch (err) {
            console.log(err)
            res.status(400).json({ err: err.message });
        }
        res.json({ success : true });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}