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

export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization == process.env.NEXT_PUBLIC_API_KEY
  ) {
    try {
      const path = require("path");
      const fs = require("fs");
      const hbs = require("nodemailer-express-handlebars");
      const hb = require("handlebars");
      const nodemailer = require("nodemailer");
      const puppeteer = require("puppeteer");
      const context = {
        email: req.body.reloadJSON.customer_email,
        model: req.body.reloadJSON.model,
        model_description: req.body.reloadJSON.color,
        paymentMethod: req.body.reloadJSON.paymentType,
        orderNumber: req.body.reloadJSON.order_id,
        date: new Date(
          req.body.reloadJSON.timestamp._seconds * 1000
        ).toDateString(),
        totalAmount: (req.body.reloadJSON.amount / 100).toFixed(2),
        htvaAmont: ((req.body.reloadJSON.amount / 100) * 0.79).toFixed(2),
        tva: ((req.body.reloadJSON.amount / 100) * 0.21).toFixed(2),
      };

      const invoicePath = path.resolve("./pages/api/mailer/views/invoice.html");
      const invoiceFile = fs.readFileSync(invoicePath, "utf8");
      const T = hb.compile(invoiceFile);
      const htmlInvoice = T(context);
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlInvoice);
      const buffer = await page.pdf({ format: "A4" });
      const base64Invoice = buffer.toString("base64");
      await browser.close();

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
          partialsDir: path.resolve("./pages/api/mailer/views"),
          defaultLayout: false,
        },
        viewPath: path.resolve("./pages/api/mailer/views"),
        extName: ".handlebars",
      };

      transporter.use("compile", hbs(options));

      const mail = {
        from: process.env.MAIL,
        to: req.body.reloadJSON.customer_email,
        subject: "Order confirmation ✔",
        template: "sendReloadReceipt",
        context: context,
        attachments: {
          filename: "receipt.pdf",
          path: `data:application/pdf;base64,${base64Invoice}`,
        },
      };

      await transporter.sendMail(mail).then(async (info) => {
        try {
          var docRef = await app
            .firestore()
            .collection("reloads")
            .doc(`${req.body.reloadJSON.stripe_checkoutID}`);

          await docRef
            .get()
            .then((doc) => {
              if (doc.exists) {
                docRef.update({
                  emailSent: true,
                  emailID: info.messageId,
                  receipt: base64Invoice,
                });
              } else {
                console.log("No such document!");
              }
            })
            .catch((error) => {
              console.log("Error getting document:", error);
            });
          res.status(200).json({ msgId: info.messageId });
        } catch (err) {
          res.status(400).json({ received: false });
        }
      });
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
