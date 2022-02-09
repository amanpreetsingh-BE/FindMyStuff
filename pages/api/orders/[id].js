import * as admin from 'firebase-admin'

const serviceAccount = require('@root/permissions.json')

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

export default async function handler(req, res) {
    if (req.method === 'GET') {
        var docRef = app.firestore().collection("orders").doc(`${req.query.id}`)
        await docRef.get().then((doc) => {
            if (doc.exists) {
                res.status(200).json(doc.data());
            } else {
                res.status(400).json({ received: false });
            }
        }).catch((error) => {
            res.status(400).json({ received: false });
        });
    } else {
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
    }
}