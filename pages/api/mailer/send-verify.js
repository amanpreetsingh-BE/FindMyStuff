/* AES-258 decipher scheme (base64 -> utf8) to get env variables*/
import { encrypted } from "@root/service-account.enc";
const crypto = require("crypto");

var decipher = crypto.createDecipheriv(
  "AES-256-CBC",
  process.env.SERVICE_ENCRYPTION_KEY,
  process.env.SERVICE_ENCRYPTION_IV
);
var decrypted =
  decipher.update(
    Buffer.from(encrypted, "base64").toString("utf-8"),
    "base64",
    "utf8"
  ) + decipher.final("utf8");

const env = JSON.parse(decrypted);

/*
 * Description : Allow to resend email activation, request verification with HASH
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.oob ===
      crypto.createHash("MD5").update(`${uid}${env.SS_API_KEY}`).digest("hex") // sanity check
  ) {
    try {
      const template =
        req.body.locale ===
        ("fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr")
          ? "d-0aaff71cc7cb4fd597128d669dfe3fd3"
          : "d-6f085881bbd9471d8c5b83e285e798d6";

      const context = {
        url: `${req.body.hostname}/${req.body.locale}/verified?oob=${req.body.oob}&uid=${req.body.uid}`,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      };
      const msg = {
        from: {
          email: "team@findmystuff.io",
          name: "FindMyStuff",
        },
        template_id: template,
        personalizations: [
          {
            to: [
              {
                email: req.body.userEmail,
              },
            ],
            dynamic_template_data: context,
          },
        ],
      };
      const axios = require("axios");
      await axios({
        method: "post",
        url: "https://api.sendgrid.com/v3/mail/send",
        headers: {
          Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
        },
        data: msg,
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
