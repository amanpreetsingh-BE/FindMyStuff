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
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL,
          pass: process.env.SECRET_MAIL,
        },
      });

      await new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            console.log("Server is ready to take our messages");
            resolve(success);
          }
        });
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

      await new Promise((resolve, reject) => {
        // send mail
        transporter.sendMail(mail, (err, info) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log(info);
            resolve(info);
          }
        });
      });
      res.status(200).json({ received: true });
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
