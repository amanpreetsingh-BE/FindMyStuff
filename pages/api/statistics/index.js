import * as admin from 'firebase-admin'

const serviceAccount = require('@root/permissions.json')

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()
  
/* return a JSON of products */
export default async function handler(req, res) {
    if (req.method === 'GET') {
      var statsJSON = []

      try {
        var usersRef = app.firestore().collection("users")
        const users = await usersRef.get();
        const usersNum = users.size

        var ordersRef = app.firestore().collection("orders")
        const orders = await ordersRef.get();
        const ordersNum = orders.size

        var msgRef = app.firestore().collection("messages")
        const msg = await msgRef.get();
        const msgNum = msg.size

        statsJSON = {
            ordersNum: ordersNum,
            usersNum: usersNum,
            msgNum: msgNum,
        }

        res.json((statsJSON))
      } catch (err) {
        console.log(err)
        res.status(err.statusCode || 500).json(err.message);
      }
    } else {
      res.setHeader('Allow', 'GET');
      res.status(405).end('Method Not Allowed');
    }
}
