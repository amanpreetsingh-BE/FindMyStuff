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
        const name = (req.body.shipping_name).split(' ')
        const context = {
            firstname: name[0],
            lastname: name[1],
            email: req.body.customer_email,
            model: req.body.model,
            model_description: req.body.color,
            paymentMethod: req.body.paymentType,
            street: req.body.shipping_address.line1,
            zip: req.body.shipping_address.postal_code,
            country: req.body.shipping_address.country,
            orderNumber: req.body.order_id,
            date: new Date(req.body.timestamp._seconds * 1000).toDateString(),
            totalAmount: (req.body.amount/100).toFixed(2),
            htvaAmont: ((req.body.amount/100)*0.79).toFixed(2),
            tva: ((req.body.amount/100)*0.21).toFixed(2),
        };

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
            to: req.body.customer_email,
            subject: "Order confirmation ✔",
            template: 'sendReceipt',
            context: context
         }

        await transporter.sendMail(mail).then(async (info) => {
            try {
                var docRef = await app.firestore().collection("orders").doc(`${req.body.stripe_checkoutID}`)
    
                await docRef.get().then((doc) => {
                    if (doc.exists) {
                        docRef.update({
                            emailSent: true,
                            emailID: info.messageId,
                        })
                    } else {
                        console.log("No such document!");
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });
    
                res.status(200).json({msgId: info.messageId});
    
            } catch (err) {
                res.status(400).json({ received: false });
            }
        })

      } catch (err) {
        res.status(err.statusCode || 500).json({error:err.message});
      }
    } else {
      res.setHeader('Allow', 'POST');
      res.status(405).end('Method Not Allowed');
    }
}