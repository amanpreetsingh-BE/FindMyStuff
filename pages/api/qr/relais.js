import * as admin from 'firebase-admin'
const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()
  
export default async function handler(req, res) {
    if (req.method === 'POST' && req.body.authorization == process.env.NEXT_PUBLIC_API_KEY) {
        const id = req.body.id
        const selection = req.body.selection
        try {
            const qrRef = app.firestore().collection("QR").doc(id)

            await qrRef.get().then((doc) => {
                if (doc.exists) {
                    qrRef.update({
                        relais: selection,
                        activate: true
                    })
                    res.status(200).json({success:true})
                } else {
                    res.status(200).json({success:false})
                }
            })
        } catch (err) {
            console.log(err)
            res.status(err.statusCode || 500).json(err.message);
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}