import * as admin from 'firebase-admin'
const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()
  
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const uid = req.body.uid
        const firstName = req.body.firstName
        const lastName = req.body.lastName
        try {
            const userRef = app.firestore().collection("users").doc(uid)

            await userRef.get().then((doc) => {
                if (doc.exists) {
                    userRef.update({
                        firstName: firstName,
                        lastName: lastName,
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