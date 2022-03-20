export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.authorization == process.env.SS_API_KEY
  ) {
    try {
      var hbs = require("nodemailer-express-handlebars");
      var nodemailer = require("nodemailer");
      const path = require("path");

      const transporter = nodemailer.createTransport({
        host: process.env.HOSTMAIL,
        port: 25,
        tls: { rejectUnauthorized: false },
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
        to: process.env.MAIL,
        subject: "Nouvelle commande ! ",
        template: "notifyOrder",
      };

      let info = await transporter.sendMail(mail);
      console.log(info);
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
    res.status(200).json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
