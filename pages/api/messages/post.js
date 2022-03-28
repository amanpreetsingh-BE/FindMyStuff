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
 * Description : Allow to post a timestamped new message in the database from someone
 * Level of credential : Public (CREATE)
 * Method : POST
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const email = req.body.email;
      const fullname = req.body.fullname;
      const message = req.body.message;
      if (!checkClientInput(email, fullname, message)) {
        throw new Error("BAD FORMAT");
      } else {
        /* Check API calls/hour to avoid spamming !!! */
        const rateLimiterDoc = app
          .firestore()
          .collection("rateLimiter")
          .doc("messages");
        const rateLimiterData = (await rateLimiterDoc.get()).data();
        // less than an hour since last call
        if (
          admin.firestore.Timestamp.now().seconds <=
          rateLimiterData.timestamp + 3600
        ) {
          if (rateLimiterData.rate <= 0) {
            throw new Error("API calls exceeded, wait and try again");
          } else {
            await addMessage(email, fullname, message);
            await decrementRateLimiter(rateLimiterDoc, rateLimiterData);
          }
        } else {
          // more than an hour
          await resetRateLimiter(rateLimiterDoc);
          await addMessage(email, fullname, message);
        }
        res.status(200).json({ success: true });
      }
    } catch (err) {
      console.log(err.message);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

/* Client-side verifications of user inputs */
function checkClientInput(email, fullname, message) {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  if (
    fullname.length <= 26 &&
    fullname.length >= 3 &&
    emailRegex.test(email) &&
    message.length >= 10 &&
    message.length <= 300
  ) {
    return true;
  } else {
    return false;
  }
}

/* Add message to DB if no API calls exceeded */
async function addMessage(email, fullname, message) {
  const docRef = app.firestore().collection("messages").doc();
  await docRef.set({
    email: email,
    fullname: fullname,
    message: message,
    timestamp: admin.firestore.Timestamp.now().seconds,
    replied: false,
    id: docRef.id,
  });
}

/* Decrement the usage of the API after adding to DB*/
async function decrementRateLimiter(rateLimiterDoc, rateLimiterData) {
  await rateLimiterDoc.update({
    rate: rateLimiterData.rate - 1,
  });
}

/* Reset the rate limiter if more than one hour ago and rate limiter is 0 */
async function resetRateLimiter(rateLimiterDoc) {
  await rateLimiterDoc.update({
    timestamp: admin.firestore.Timestamp.now().seconds,
    rate: 100, // limit to 100 create call per hour
  });
}
