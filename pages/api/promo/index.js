import * as admin from 'firebase-admin'

const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

/* return a JSON of products */
export default async function handler(req, res) {
    if (req.method === 'GET' && req.query.authorization == process.env.NEXT_PUBLIC_API_KEY) {
      const couponsJSON = []

      try {
        /* COUPONS */
        var couponsRef = app.firestore().collection("coupons")
        const couponsSnapshot = await couponsRef.get();

        couponsSnapshot.forEach((doc) => {
            couponsJSON.push(doc.data())
        })

        res.json((couponsJSON))
      } catch (err) {
        console.log(err)
        res.status(err.statusCode || 500).json(err.message);
      }
    } else {
      res.setHeader('Allow', 'GET');
      res.status(405).end('Method Not Allowed');
    }
}
