import * as admin from 'firebase-admin'
const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()
  
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const id = req.body.id
        const email = req.body.email

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

        const mail = {
            from: process.env.MAIL,
            to: email,
            subject: `Someone has scanned your QR : ${id} !`,
            template: 'notifyFound',
            context: {
                id: id,
            },
        }

        try {
            const notifRef = app.firestore().collection("notifications").doc(id)
            await notifRef.get().then(async (doc) => {
                if (doc.exists) {
                    var s = doc.data().scan
                    s.push({timestamp:admin.firestore.Timestamp.now().seconds})
                    notifRef.update({
                        scan: s
                    })
                    await transporter.sendMail(mail)
                    res.status(200).json({success:true})
                } else {
                    var s = []
                    s.push({
                        timestamp: admin.firestore.Timestamp.now().seconds,
                        visible: true
                    })
                    app.firestore().collection("notifications").doc(id).set({
                        id: id,
                        email: email,
                        scan: s,
                        delivery: [],
                        needToGenerate: false,
                    })
                    await transporter.sendMail(mail)
                    res.status(200).json({success:false})
                }
            })
        } catch (err) {
            res.status(err.statusCode || 500).json(err.message);
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}