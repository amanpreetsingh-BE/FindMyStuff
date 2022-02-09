import * as admin from 'firebase-admin'

const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

/* return a JSON of products */
export default async function handler(req, res) {
    if (req.method === 'GET') {
      try {
        var type = ""
        const userEmail = req.query.userEmail
        const token = req.query.token
        const decodedToken = await app.auth().verifyIdToken(token, true)
        const user = await app.auth().getUser(decodedToken.uid)
        if(user.email === userEmail){

          const query = app.firestore().collection("users").where("email", "==", req.query.userEmail);
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
                      }
                  })
              }
          })
        } else {
          type = "invalid"
        }
        res.json({type});
      } catch (err) {
        res.status(err.statusCode || 500).json({error:err.message});
      }
    } else {
      res.setHeader('Allow', 'GET');
      res.status(405).end('Method Not Allowed');
    }
}