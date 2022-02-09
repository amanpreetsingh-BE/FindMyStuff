import * as admin from 'firebase-admin'

const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

export default async function handler(req, res) {
    if (req.method === 'POST') {

        console.log(req.body.file)
        const id = req.body.id
        try {
            var docRef = app.firestore().collection(`messages`).doc(`${id}`)
            docRef.get().then(async (doc) => {
                if (doc.exists) {
                    docRef.update({
                        replied: true
                    })
                    
                    await (fetch('https://us-central1-findmystuff-74e93.cloudfunctions.net/api/mailer/replymsg', {
                        method: 'POST',
                        headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: req.body.id,
                            formTitle: req.body.formTitle,
                            formMessage: req.body.formMessage,
                            modalEmail: req.body.modalEmail,
                            fileURL : req.body.fileURL,
                            fileName :  req.body.fileName,
                        })
                    }));
                } else {
                    console.log("No such document!");
                }
            });
        } catch (err) {
            res.status(400).json({ received: false });
        }
        res.json({ received: true });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}