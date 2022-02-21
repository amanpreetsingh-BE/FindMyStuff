import * as admin from 'firebase-admin'
const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()
  
export default async function handler(req, res) {
    if (req.method === 'GET') {
        const id = req.query.id
        try {
            let verified = false
            let activate = false
            let email = ''
            let jetons = null
            let relais = null
            await app.firestore().collection("QR").doc(id).get().then((docSnapshot) => {
                if(docSnapshot.exists){
                    verified = true
                    activate = docSnapshot.data().activate
                    relais = docSnapshot.data().relais
                    email = docSnapshot.data().email
                    jetons = docSnapshot.data().jetons
                } else {
                    verified = false
                }
            })
            
            res.json({
                verified : verified,
                activate : activate,
                relais: relais,
                email: email,
                jetons: jetons
            })
        } catch (err) {
            console.log(err)
            res.status(err.statusCode || 500).json(err.message);
        }
    } else {
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
    }
}
