export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization == process.env.SS_API_KEY
  ) {
    /*console.log("RUN");
    try {
      var hbs = require("nodemailer-express-handlebars");
      var nodemailer = require("nodemailer");
      const path = require("path");

      const transporter = nodemailer.createTransport({
        host: process.env.HOSTMAIL,
        port: 465,
        secure: true, // Must be true, false will fail
        auth: {
          user: process.env.MAIL,
          pass: process.env.SECRET_MAIL,
        },
        dkim: {
          domainName: "findmystuff.io",
          keySelector: "default",
          privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...",
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
        to: process.env.MAIL,
        subject: "Nouvelle commande ! ",
        template: "notifyOrder",
      };

      let info = await transporter.sendMail(mail);
      console.log(info);
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }*/
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: "amanpreet@outlook.be", // Change to your recipient
      from: "team@findmystuff.io", // Change to your verified sender
      subject: "Sending with SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };
    try {
      let r = await sgMail.send(msg);
      res.status(200).json({ received: true, r: r });
    } catch (err) {
      console.log(err.message);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
