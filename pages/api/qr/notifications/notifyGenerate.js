import * as admin from 'firebase-admin'
const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()
  
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const fullName = req.body.fullName
        const iban = req.body.iban
        const expire = req.body.expire
        const timestamp = req.body.timestamp
        const id = req.body.id
        const donation = req.body.donation

        try {

            var hbs = require('nodemailer-express-handlebars');
            var nodemailer = require('nodemailer')
            const path = require("path")
    
            const transporter = nodemailer.createTransport({
                host: "mail.privateemail.com",
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: process.env.MAIL,
                    pass: process.env.SECRET_MAIL,
                },
            });
    
            const options = {
                viewEngine: {
                    extName: ".html",
                    partialsDir: path.resolve('./pages/api/mailer/views'),
                    defaultLayout: false, 
                },
                viewPath: path.resolve('./pages/api/mailer/views'),
                extName: ".handlebars"
            }
    
            transporter.use('compile', hbs(options));

            let qrData
            let userData
            const qrRef = app.firestore().collection("QR").doc(id)
            const notifRef = app.firestore().collection("notifications").doc(id)
            await qrRef.get().then(async (doc) => {
                qrData = doc.data()
                await app.firestore().collection('users').where('email', '==', qrData.email).get().then((querySnapshot)=>{
                    querySnapshot.forEach((doc) => {
                        userData = doc.data()
                    })
                })

                const finderRef = app.firestore().collection("finders").doc(id)
                await finderRef.get().then(async (doc) => {
                    if (doc.exists) {
                        finderRef.update({
                            fullName: fullName,
                            iban: iban,
                            donation: donation,
                            id: doc.id,
                            ownerFirstName : userData.firstName,
                            ownerLastName : userData.lastName,
                            relaisNum : qrData.relais.num,
                            relaisHeading: qrData.relais.heading,
                        })
                    } else {
                        app.firestore().collection("finders").doc(id).set({
                            fullName: fullName,
                            iban: iban,
                            donation: donation,
                            id: doc.id,
                            ownerFirstName : userData.firstName,
                            ownerLastName : userData.lastName,
                            relaisNum : qrData.relais.num,
                            relaisHeading: qrData.relais.heading,
                        })
                    }
                })

                const mail = {
                    from: process.env.MAIL,
                    to: process.env.MAIL,
                    subject: `${id} NEEDS QR GENERATION !`,
                    template: 'notifyGenerate',
                    context: {
                        id: id,
                        email : qrData.email,
                        firstName : userData.firstName,
                        lastName : userData.lastName,
                        relaisName : qrData.relais.heading,
                        relaisNum : qrData.relais.num,
                        relaisStreet : qrData.relais.street,
                        relaisCP : qrData.relais.code,
                    },
                }
                
                // Generetae if no timestamp (first time) or expired qr
                if(!timestamp || expire){
                    await transporter.sendMail(mail)

                    await notifRef.get().then(async () => {
                        notifRef.update({
                            needToGenerate:true
                        })
                    })
                }
                res.status(200).json({success:true})
            })
        } catch (err) {
            res.status(err.statusCode || 500).json(err.message);
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}