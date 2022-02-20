import * as admin from 'firebase-admin'

const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

/* return a JSON of products */
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const uid = req.body.uid
        const email = req.body.email
        //res.status(200).json({success:true})
        try{
            return app.auth().deleteUser(uid).then(() =>{
                app.firestore().collection("users").where("email", "==", email).get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        doc.ref.delete()
                    })
                    app.firestore().collection('QR').where('email', '==', email).get().then((querySnapshot)=>{
                        querySnapshot.forEach((doc) => {
                            doc.ref.update({
                                email:"",
                                relais:null,
                                activate:false,
                                jetons: 1
                            })
                        })
                        app.firestore().collection('notifications').where('email', '==', email).get().then((querySnapshot)=>{
                            querySnapshot.forEach((doc) => {
                                doc.ref.delete()
                            })
                            res.status(200).json({success:true})
                        })
                    })
                })
            })
        } catch(err){
            res.status(err.statusCode || 500).json(err.message);
        }
                        
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}

                        /**/