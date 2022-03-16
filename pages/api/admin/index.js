import * as admin from 'firebase-admin'

const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

export default async function handler(req, res) {
    if (req.method === 'POST' && req.body.authorization == process.env.NEXT_PUBLIC_API_KEY) {
      try {
        var admin = false
        var type = ""
        const query = app.firestore().collection("users").where("email", "==", req.body.email);
        await query.get().then((querySnapshot) => {
            if(querySnapshot.empty){
                type = "invalid"
            } else {
                querySnapshot.forEach((doc) => {
                    if(doc.data().admin){
                        type = "admin"
                    }
                    else{
                        type = "user"
                        app.firestore().collection("users").doc(doc.id).update({
                            admin: true
                        })
                        admin = true
                    }
                })
            }
        })
        res.json({type, admin});
      } catch (err) {
        res.status(err.statusCode || 500).json({error:err.message});
      }
    } else {
      res.setHeader('Allow', 'POST');
      res.status(405).end('Method Not Allowed');
    }
}