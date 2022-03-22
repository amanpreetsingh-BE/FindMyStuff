/* Custom components imports */
import NavReduced from "@components/navbar/NavReduced";
import { useRouter } from "next/router";

/* Icons imports */
import { CheckCircleIcon } from "@heroicons/react/outline";

/* Translate imports */
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export async function getServerSideProps({ query, locale }) {
  const { JSDOM } = require("jsdom");

  const { window } = new JSDOM();

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
    // If the email confirmation is not sent, do logic else refresh only
    if (!orderJSON.emailSent) {
      try {
        /* STEP 1 : Generate PDF base64 and send email to customer  */
        const context = {
          fullname: orderJSON.shipping_name,
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
        var start = window.performance.now();
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

        var stop = window.performance.now();
        console.log(
          `Time Taken to execute PDF fetch = ${(stop - start) / 1000} seconds`
        );

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
        start = window.performance.now();
        axios({
          method: "post",
          url: "https://api.sendgrid.com/v3/mail/send",
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          },
          data: msg,
        });
        var stop = window.performance.now();
        console.log(
          `Time Taken to execute send mail = ${(stop - start) / 1000} seconds`
        );

        /* STEP 2 : Update email state with firebase admin sdk */
        const admin = require("firebase-admin");
        const serviceAccount = JSON.parse(
          Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
        );
        const app = !admin.apps.length
          ? admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
            })
          : admin.app();
        var docRef = app
          .firestore()
          .collection("orders")
          .doc(`${orderJSON.stripe_checkoutID}`);

        await docRef.get().then((doc) => {
          docRef.update({
            emailSent: true,
            receipt: respJSON.base64PDF,
          });
        });

        /* STEP 3 : Notify admin to prepare the order */
        /*var hbs = require("nodemailer-express-handlebars");
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

        await transporter.sendMail(mail);*/
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
