import * as admin from 'firebase-admin'

const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

export default async function handler(req, res) {
    if (req.method === 'POST') {
        if(req.body.authorization != process.env.NEXT_PUBLIC_API_KEY){
            return res.status(404).json({success : false, authorized: false})
        }
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
        } catch (err) {
            res.status(err.statusCode || 500).json({error:err.message});
        }
        res.status(200).json({ success: true, authorized: true });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}