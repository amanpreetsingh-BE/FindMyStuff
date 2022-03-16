import * as admin from 'firebase-admin'
const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()
  

export default async function handler(req, res) {
    if (req.method === 'POST' && req.body.authorization == process.env.NEXT_PUBLIC_API_KEY) {
      try {
        const email = req.body.email
        const id = req.body.id
        const pdf = req.body.pdf
        const qrRef = app.firestore().collection("QR").doc(id)
        const notifRef = app.firestore().collection("notifications").doc(id)
        qrRef.update({
            timestamp: admin.firestore.Timestamp.now().seconds,
            pdf: pdf,
        })
        notifRef.update({
            needToGenerate: false
        })
        res.status(200).json({success:true})

        } catch (err) {
            res.status(err.statusCode || 500).json({error:err.message});
        }
    } else {
      res.setHeader('Allow', 'POST');
      res.status(405).end('Method Not Allowed');
    }
}