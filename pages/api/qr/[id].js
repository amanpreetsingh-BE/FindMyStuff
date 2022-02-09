import * as admin from 'firebase-admin'
const serviceAccount = require('@root/permissions.json')

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()
  
export default async function handler(req, res) {
    if (req.method === 'GET') {
        const id = req.query.id
        try {
            let verified = false
            let activate = false
            await app.firestore().collection("qr").doc(id).get().then((docSnapshot) => {
                if(docSnapshot.exists){
                    verified = true
                    activate = docSnapshot.data().activate
                } else {
                    verified = false
                }
            })
            
            res.json({
                verified : verified,
                activate : activate
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
