import * as admin from 'firebase-admin'
import Stripe from 'stripe'

const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST') {

        const promoID = req.body.promoID
        const couponID = req.body.couponID
        
        try {
            const deleted = await stripe.coupons.del(
                couponID
            );

            var query = app.firestore().collection('coupons').where('id','==', promoID);
            query.get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    doc.ref.delete();
                });
            });
            
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