import * as admin from 'firebase-admin'

const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()
  
export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {
        var hbs = require('nodemailer-express-handlebars');
        var nodemailer = require('nodemailer')
        const path = require("path")
        const id = req.body.id

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
        
        let attach = null

        if(req.body.fileURL){
            attach = {
                filename: req.body.fileName,
                path: req.body.fileURL
            }
        }

        const mail = {
            from: process.env.MAIL,
            to: req.body.modalEmail,
            subject: req.body.formTitle,
            template: 'sendEmail',
            context: {
                fullname: req.body.fullname,
                txt: req.body.formMessage 
            },
            attachments: attach
         }

        await transporter.sendMail(mail).then(() => {
            try {
                var docRef = app.firestore().collection(`messages`).doc(`${id}`)
                docRef.get().then(async (doc) => {
                    if (doc.exists) {
                        docRef.update({
                            replied: true
                        })
                    } else {
                        console.log("No such document!");
                    }
                });
            } catch (err) {
                res.status(400).json({ received: false });
            }
            res.json({ received: true });
        });
      } catch (err) {
        res.status(err.statusCode || 500).json({error:err.message});
      }
    } else {
      res.setHeader('Allow', 'POST');
      res.status(405).end('Method Not Allowed');
    }
}