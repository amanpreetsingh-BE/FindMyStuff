import * as admin from 'firebase-admin'
const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()
  
export default async function handler(req, res) {
    if (req.method === 'POST' && req.body.authorization == process.env.NEXT_PUBLIC_API_KEY) {
        const id = req.body.id
        try {
            let verified = false
            let activate = false
            let email = ''
            let jetons = null
            let relais = null
            let timestamp = null
            let pdf = null
            await app.firestore().collection("QR").doc(id).get().then((docSnapshot) => {
                if(docSnapshot.exists){
                    verified = true
                    activate = docSnapshot.data().activate
                    relais = docSnapshot.data().relais
                    email = docSnapshot.data().email
                    jetons = docSnapshot.data().jetons
                    pdf = docSnapshot.data().pdf
                    timestamp = docSnapshot.data().timestamp
                } else {
                    verified = false
                }
            })
            
            res.json({
                verified : verified,
                activate : activate,
                relais: relais,
                email: email,
                jetons: jetons,
                timestamp: timestamp,
                pdf : pdf
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
