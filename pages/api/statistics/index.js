import * as admin from "firebase-admin";

/* Import base64 encoded private key from firebase and initialize firebase */
const serviceAccount = JSON.parse(
  Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

/*
 * Description : GET statistics (#users, #orders, #msg) ; TBD in V2
 * Level of credential : Private (ADMIN)
 * Method : GET
 */
export default async function handler(req, res) {
  if (
    req.method === "GET" &&
    req.query.authorization == process.env.SS_API_KEY
  ) {
    var statsJSON = [];

    try {
      var usersRef = app.firestore().collection("users");
      const users = await usersRef.get();
      const usersNum = users.size;

      var ordersRef = app.firestore().collection("orders");
      const orders = await ordersRef.get();
      const ordersNum = orders.size;

      var msgRef = app.firestore().collection("messages");
      const msg = await msgRef.get();
      const msgNum = msg.size;

      statsJSON = {
        ordersNum: ordersNum,
        usersNum: usersNum,
        msgNum: msgNum,
      };

      res.json(statsJSON);
    } catch (err) {
      console.log(err);
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "GET");
    res.status(405).end("Method Not Allowed");
  }
}
