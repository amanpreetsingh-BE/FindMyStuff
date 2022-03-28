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
      var hbs = require("nodemailer-express-handlebars");
      var nodemailer = require("nodemailer");
      const path = require("path");

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

      let attach = null;

      if (req.body.fileURL) {
        attach = {
          filename: req.body.fileName,
          path: req.body.fileURL,
        };
      }

      app
        .firestore()
        .collection("users")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach(async (doc) => {
            doc.data().email;
            await transporter.sendMail({
              from: process.env.MAIL,
              to: doc.data().email,
              subject: req.body.title,
              template: "sendNewsletter",
              context: {
                message: req.body.message,
              },
              attachments: attach,
            });
          });
        });

      res.json({ received: true });
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
