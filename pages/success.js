/* Custom components imports */
import NavReduced from "@components/navbar/NavReduced";
import { useRouter } from "next/router";

/* Icons imports */
import { CheckCircleIcon } from "@heroicons/react/outline";

/* Translate imports */
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export async function getServerSideProps({ query, locale }) {
  const URL_session_id = query.session_id;

  const checkout = await fetch(
    `${process.env.HOSTNAME}/api/checkout/${URL_session_id}`
  );
  const checkoutJSON = await checkout.json();

  // If the checkout session is valid and paid, fetch the data
  if (checkoutJSON.id && checkoutJSON.payment_status == "paid") {
    const order = await fetch(
      `${process.env.HOSTNAME}/api/orders/${URL_session_id}`
    );
    const orderJSON = await order.json();
    // If the email confirmation is not sent, send the receipt
    if (!orderJSON.emailSent) {
      try {
        /* STEP 1 : GENERATE PDF RECEIPT BASE64 */
        //const sgMail = require("@sendgrid/mail");
        //sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const context = {
          fullname: orderJSON.shipping_name,
          firstname: orderJSON.shipping_name.split(" ")[0],
          lastname: orderJSON.shipping_name.split(" ")[1],
          email: orderJSON.customer_email,
          model: orderJSON.model,
          model_description: orderJSON.color,
          paymentMethod: orderJSON.paymentType,
          street: orderJSON.shipping_address.line1,
          zip: orderJSON.shipping_address.postal_code,
          country: orderJSON.shipping_address.country,
          orderNumber: orderJSON.order_id,
          date: new Date(orderJSON.timestamp._seconds * 1000).toDateString(),
          totalAmount: (orderJSON.amount / 100).toFixed(2),
          htvaAmont: ((orderJSON.amount / 100) * 0.79).toFixed(2),
          tva: ((orderJSON.amount / 100) * 0.21).toFixed(2),
        };
        const path = require("path");
        const fs = require("fs");
        const invoicePath = path.resolve("templates/invoice.html");
        const invoiceFile = fs.readFileSync(invoicePath, "utf8");

        const resp = await fetch(
          "https://regal-melomakarona-dc80f3.netlify.app/api/getPDF",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: process.env.HTML2PDF_TOKEN,
              html: invoiceFile,
              context: context,
            }),
          }
        );
        const respJSON = await resp.json();
        const template =
          "fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr"
            ? "d-e9d5aad158834b0d86925e9140733ff8"
            : "d-2714a9e6d65d4e79ad2ba5159ba2f0fa";

        const msg = {
          from: {
            email: process.env.MAIL,
            name: "FindMyStuff",
          },
          template_id: template,
          personalizations: [
            {
              to: [
                {
                  email: orderJSON.customer_email,
                },
              ],
              dynamic_template_data: context,
            },
          ],
          attachments: [
            {
              content: `${respJSON.base64PDF}`,
              filename: "receipt.pdf",
              type: "application/pdf",
              disposition: "attachment",
            },
          ],
        };
        const axios = require("axios");
        axios({
          method: "post",
          url: "https://api.sendgrid.com/v3/mail/send",
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          },
          data: msg,
        });
        /*
        const msg = {
          from: {
            email: process.env.MAIL,
            name: "FindMyStuff",
          },
          to: orderJSON.customer_email,
          template_id:
            locale ===
            ("fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr")
              ? "d-e9d5aad158834b0d86925e9140733ff8"
              : "d-2714a9e6d65d4e79ad2ba5159ba2f0fa",
          dynamic_template_data: {
            fullname: orderJSON.shipping_name,
            firstname: orderJSON.shipping_name.split(" ")[0],
            lastname: orderJSON.shipping_name.split(" ")[1],
            email: orderJSON.customer_email,
            model: orderJSON.model,
            model_description: orderJSON.color,
            paymentMethod: orderJSON.paymentType,
            street: orderJSON.shipping_address.line1,
            zip: orderJSON.shipping_address.postal_code,
            country: orderJSON.shipping_address.country,
            orderNumber: orderJSON.order_id,
            date: new Date(orderJSON.timestamp._seconds * 1000).toDateString(),
            totalAmount: (orderJSON.amount / 100).toFixed(2),
            htvaAmont: ((orderJSON.amount / 100) * 0.79).toFixed(2),
            tva: ((orderJSON.amount / 100) * 0.21).toFixed(2),
          },
          attachments: [
            {
              content: `data:application/pdf;base64,${respJSON.base64PDF}`,
              filename: "receipt.pdf",
              type: "application/pdf",
              disposition: "attachment",
            },
          ],
        };
        console.log(msg);
        emailINFO = await sgMail.send(msg);
        */
        /* STEP 2 : Update email state */
        const update = await fetch(
          `${process.env.HOSTNAME}/api/orders/updateEmailState`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: orderJSON.stripe_checkoutID,
              emailINFO: "SUCCESS 200",
              base64Invoice: respJSON.base64PDF,
              authorization: process.env.SS_API_KEY,
            }),
          }
        );
        const updateJSON = await update.json();
        if (!updateJSON.success) {
          throw new Error("ERROR UPDATING EMAIL STATE");
        }

        var hbs = require("nodemailer-express-handlebars");
        var nodemailer = require("nodemailer");

        const transporter = nodemailer.createTransport({
          host: process.env.HOSTMAIL,
          port: 465,
          secure: true, // Must be true, false will fail
          auth: {
            user: process.env.MAIL,
            pass: process.env.SECRET_MAIL,
          },
        });

        const options = {
          viewEngine: {
            extName: ".html",
            partialsDir: path.resolve("templates"),
            defaultLayout: false,
          },
          viewPath: path.resolve("templates"),
          extName: ".handlebars",
        };

        transporter.use("compile", hbs(options));

        const mail = {
          from: process.env.MAIL,
          to: process.env.MAIL,
          subject: "Nouvelle commande / New order ! ",
          template: "notifyOrder",
        };

        await transporter.sendMail(mail);
      } catch (err) {
        console.log(err.message);
      }
    }
    return {
      props: {
        order_id: JSON.stringify(orderJSON.order_id),
        order_email: JSON.stringify(orderJSON.customer_email),
        ...(await serverSideTranslations(locale, ["payment"])),
        locale,
      },
    };
  } else {
    return {
      notFound: true,
    };
  }
}

export default function Success(props) {
  /* Handle language */
  const { t } = useTranslation();
  /* Used to push to dashboard */
  const router = useRouter();
  const order_id = JSON.parse(props.order_id);
  const customer_email = JSON.parse(props.order_email);
  return (
    <main>
      <NavReduced darkLogo={true} />
      <div className="w-4/5 mt-12 max-w-2xl mx-auto flex flex-col items-center space-y-2">
        <CheckCircleIcon className="w-10 text-secondaryHover h-10 sm:w-12 sm:h-12" />
        <h1 className="text-xl text-center tracking-wide font-['Roboto'] sm:text-2xl">
          {t("payment:heading")}
        </h1>
        <p className="text-xs sm:text-sm text-center">{t("payment:desc")}</p>
        <p className="text-xs sm:text-sm text-gray-600 text-center">
          {order_id}
        </p>
        <p className="text-xs sm:text-sm text-center max-w-xs">
          {t("payment:sub_desc")}
        </p>
        <p className="text-xs sm:text-sm text-gray-600 text-center">
          {customer_email}
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-secondary cursor-pointer hover:bg-secondaryHover text-white font-bold rounded-lg px-12 py-4"
        >
          {t("payment:goHome")}
        </button>
      </div>
    </main>
  );
}
