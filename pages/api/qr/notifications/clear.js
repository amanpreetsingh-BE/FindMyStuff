import * as admin from 'firebase-admin'

const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

/* return a JSON of products */
export default async function handler(req, res) {
    if (req.method === 'POST' && req.body.authorization == process.env.NEXT_PUBLIC_API_KEY) {
        const email = req.body.email
        const type = req.body.type
        try{
            return app.firestore().collection("notifications").where("email", "==", email).get().then((querySnapshot) => {
                var arr = []
                if(type == "scan"){
                    querySnapshot.forEach((doc) => {
                        doc.ref.update({
                            scan: arr
                        })
                    })
                } else {
                    querySnapshot.forEach((doc) => {
                        doc.ref.update({
                            delivery: arr
                        })
                    })
                }
                res.status(200).json({success:false})
            })
        } catch(err){
            res.status(err.statusCode || 500).json(err.message);
        }
                        
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}