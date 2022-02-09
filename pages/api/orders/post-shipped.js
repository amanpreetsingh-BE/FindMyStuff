import * as admin from 'firebase-admin'

const serviceAccount = require('@root/permissions.json')

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const id = req.body.id
        try {
            var docRef = app.firestore().collection(`orders`).doc(`${id}`)
            docRef.get().then(async (doc) => {
                if (doc.exists) {
                    docRef.update({
                        shipped: true
                    })
                    /* run firebase api cloud function node-mailer */
                    await (fetch('https://us-central1-findmystuff-74e93.cloudfunctions.net/api/checkout/send-shipped', {
                        method: 'POST',
                        headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(doc.data())
                    }));
                } else {
                    console.log("No such document!");
                }
            });
        } catch (err) {
            res.status(400).json({ received: false });
        }
        res.json({ received: true });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}