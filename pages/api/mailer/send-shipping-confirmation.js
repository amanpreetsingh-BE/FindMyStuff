import * as admin from 'firebase-admin'

const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()

export default async function handler(req, res) {
    if (req.method === 'POST' && req.body.authorization == process.env.NEXT_PUBLIC_API_KEY) {
        const id = req.body.id
        try {
            var docRef = app.firestore().collection(`orders`).doc(`${id}`)
            docRef.get().then(async (doc) => {
                if (doc.exists) {
                    docRef.update({
                        shipped: true
                    })

                    var hbs = require('nodemailer-express-handlebars');
                    var nodemailer = require('nodemailer')
                    const path = require("path")

                    const transporter = nodemailer.createTransport({
                        host: process.env.HOSTMAIL,
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

                    const data = doc.data()

                    const mail = {
                        from: process.env.MAIL,
                        to: data.customer_email,
                        subject: `Order ${data.order_id} has been shipped ✔`, // Subject line
                        template: 'sendShipped',
                        context: {
                            fullname: data.shipping_name,
                            orderID: data.order_id,
                        }
                     }

                     await transporter.sendMail(mail).then(()=>{
                        res.status(200).json({ received: true });
                     })
                     
                } else {
                    res.status(400).json({ received: false });
                    console.log("No such document!");
                }
            });
        } catch (err) {
            res.status(400).json({ received: false });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}