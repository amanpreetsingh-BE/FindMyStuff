export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization == process.env.SS_API_KEY
  ) {
    try {
      console.log(process.env.SS_API_KEY);
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

      /*const options = {
        viewEngine: {
          extName: ".html",
          partialsDir: path.resolve("./pages/api/mailer/views"),
          defaultLayout: false,
        },
        viewPath: path.resolve("./pages/api/mailer/views"),
        extName: ".handlebars",
      };

      transporter.use("compile", hbs(options));*/

      const mail = {
        from: process.env.MAIL,
        to: process.env.MAIL,
        subject: "Nouvelle commande ! ",
        text: "I hope this message gets delivered!",
        // template: "notifyOrder",
      };

      await transporter.sendMail(mail);
      res.status(200).json({ received: true });
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
