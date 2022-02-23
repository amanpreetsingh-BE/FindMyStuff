import * as admin from 'firebase-admin'
const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()
  
export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            var finders = []
            var findersRef = app.firestore().collection("finders")
            const findersSnapshot = await findersRef.get();
    
            findersSnapshot.forEach((doc) => {
                finders.push(doc.data())
            })
            res.status(200).json(finders)
        } catch (err) {
            console.log(err)
            res.status(err.statusCode || 500).json(err.message);
        }
    } else {
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
    }
}
