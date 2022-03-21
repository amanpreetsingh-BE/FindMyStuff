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
        /* STEP 1 : GENERATE PDF RECEIPT BASE64 and SEND EMAIL to customer */
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
        const hb = require("handlebars");
        const puppeteer = require("puppeteer");
        const invoicePath = path.resolve("./.netlify/invoice.html");
        const invoiceFile = fs.readFileSync(invoicePath, "utf8");
        const T = hb.compile(invoiceFile);
        const htmlInvoice = T(context);
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlInvoice);
        const buffer = await page.pdf({ format: "A4" });
        const base64Invoice = buffer.toString("base64");
        await browser.close();

        const msg = {
          to: orderJSON.customer_email,
          from: {
            email: process.env.MAIL,
            name: "FindMyStuff",
          },
          templateId:
            locale ===
            ("fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr")
              ? process.env.CHECKOUT_TEMPLATE_ID_FR
              : process.env.CHECKOUT_TEMPLATE_ID_EN,
          dynamic_template_data: context,
          attachments: [
            {
              content: base64Invoice,
              filename: "receipt.pdf",
              type: "application/pdf",
              disposition: "attachment",
            },
          ],
        };
        let emailINFO = await sgMail.send(msg);

        const data = {
          id: orderJSON.stripe_checkoutID,
          emailINFO: emailINFO,
          base64Invoice: base64Invoice,
          authorization: process.env.NEXT_PUBLIC_API_KEY,
        };
        const response = await fetch(
          `${process.env.HOSTNAME}/api/orders/updateEmailState`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );
        const responseJSON = await response.json();
        if (!responseJSON.success) {
          throw new Error("ERROR UPDATING EMAIL STATE");
        }

        /* STEP 2 : NOTIFY admin new order using NODEMAILER --> NO COST */
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
            partialsDir: path.resolve("./.netlify/"),
            defaultLayout: false,
          },
          viewPath: path.resolve("./"),
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
