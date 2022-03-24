import * as admin from "firebase-admin";

const serviceAccount = JSON.parse(
  Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
);

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

/*
 * Description : GET JSON of products
 * Level of credential : Public
 * Method : GET
 */
export default async function handler(req, res) {
  if (req.method === "GET") {
    const productsJSON = [];

    try {
      /* KEYCHAINS */
      var keychainRef = app.firestore().collection("products/Keychain/id/");
      const keychainSnapshot = await keychainRef.get();

      const keychainsID = [];
      const keychains = [];

      keychainSnapshot.forEach((keychainDoc) => {
        keychainsID.push(keychainDoc.id);
      });
      for (let i = 0; i < keychainsID.length; i++) {
        var colorRef = app
          .firestore()
          .collection(`products/Keychain/id/${keychainsID[i]}/colors/`);
        const colorSnapshot = await colorRef.get();
        const colors = [];
        colorSnapshot.forEach((colorDoc) => {
          colors.push(colorDoc.data());
        });

        keychains.push({
          id: keychainsID[i],
          colors: colors,
        });
      }
      /* STICKERS */
      var StickerRef = app.firestore().collection("products/Sticker/id");
      const stickerSnapshot = await StickerRef.get();

      const stickers = [];

      stickerSnapshot.forEach((stickerDoc) => {
        stickers.push({
          id: stickerDoc.id,
          data: stickerDoc.data(),
        });
      });

      /* TRACKERS */
      var TrackerRef = app.firestore().collection("products/Tracker/id");
      const trackerSnapshot = await TrackerRef.get();

      const trackers = [];

      trackerSnapshot.forEach((trackerDoc) => {
        trackers.push({
          id: trackerDoc.id,
          data: trackerDoc.data(),
        });
      });

      /* OTHERS */
      var OtherRef = app.firestore().collection("products/Other/id");
      const OtherSnapshot = await OtherRef.get();

      const others = [];

      OtherSnapshot.forEach((otherDoc) => {
        others.push({
          id: otherDoc.id,
          data: otherDoc.data(),
        });
      });

      keychains.reverse();
      productsJSON.push(keychains);
      productsJSON.push(stickers);
      productsJSON.push(trackers);
      productsJSON.push(others);

      res.json(productsJSON);
    } catch (err) {
      console.log(err);
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "GET");
    res.status(405).end("Method Not Allowed");
  }
}
