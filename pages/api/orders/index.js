import * as admin from 'firebase-admin'

const serviceAccount = require('@root/permissions.json')

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

export default async function handler(req, res) {
    if (req.method === 'GET') {
      try {
        const orders = [];
        const query = app.firestore().collection("orders").orderBy("timestamp", "desc");
        const snapshot = await query.get();

        snapshot.forEach((doc) => {
            orders.push(doc.data());
        });

        res.json((orders));
      } catch (err) {
        res.status(err.statusCode || 500).json(err.message);
      }
    } else {
      res.setHeader('Allow', 'GET');
      res.status(405).end('Method Not Allowed');
    }
}