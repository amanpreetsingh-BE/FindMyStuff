import * as admin from 'firebase-admin'

const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            var docRef = app.firestore().collection("messages").doc()
            docRef.set({
                email: req.body.email,
                fullname: req.body.fullname,
                message: req.body.message,
                timestamp: admin.firestore.Timestamp.now().seconds,
                replied : false,
                id : docRef.id
            })
            await (fetch('https://us-central1-findmystuff-74e93.cloudfunctions.net/api/mailer/newmsg', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: req.body.email,
                    fullname: req.body.fullname,
                    message: req.body.message,
                    replied : false,
                })
            }));
        } catch (err) {
            res.status(400).json({ received: false });
        }
        res.json({ received: true });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}