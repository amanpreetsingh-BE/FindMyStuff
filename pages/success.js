/* Custom components imports */
import NavReduced from "@components/navbar/NavReduced";
import { useRouter } from "next/router";

/* Icons imports */
import { CheckCircleIcon } from "@heroicons/react/outline";

/* Translate imports */
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export async function getServerSideProps({ query, locale }) {
  /* Libs needed for checkout logic */
  const path = require("path");
  const axios = require("axios");
  var hbs = require("nodemailer-express-handlebars");
  var nodemailer = require("nodemailer");
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const admin = require("firebase-admin");

  const serviceAccount = JSON.parse(
    Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
  );
  const app = !admin.apps.length
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    : admin.app();
  /* Get checkout ID */

  const URL_session_id = query.session_id;

  let checkoutJSON = null;
  try {
    if (!URL_session_id.startsWith("cs_")) {
      throw Error("Incorrect CheckoutSession ID.");
    } else {
      checkoutJSON = await stripe.checkout.sessions.retrieve(
        `${URL_session_id}`
      );
    }
  } catch (err) {
    console.log(err.message);
  }

  /* If the checkout session is valid and paid, fetch the order */
  if (checkoutJSON && checkoutJSON.payment_status == "paid") {
    let orderJSON = null;
    const docRef = app
      .firestore()
      .collection("orders")
      .doc(`${URL_session_id}`);
    const docSnap = await docRef.get();
    try {
      if (docSnap.exists) {
        orderJSON = docSnap.data();
      } else {
        throw Error("No order found in DB :(");
      }
    } catch (err) {
      console.log(err.message);
      return {
        notFound: true,
      };
    }

    // If the email confirmation is not sent, do logic else refresh only
    if (!orderJSON.emailSent) {
      /* STEP 1 : Send email to customer with context and update email state */
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
        prodURL: orderJSON.imgURL,
      };

      const template =
        locale === ("fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr")
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
      };
      try {
        axios({
          method: "post",
          url: "https://api.sendgrid.com/v3/mail/send",
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          },
          data: msg,
        });

        docRef.update({
          emailSent: true,
        });
      } catch (err) {
        console.log(message.err);
      }

      /* STEP 2 : Notify admin to prepare the order */
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
      try {
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
      <NavReduced darkLogo={false} />
      <div className="flex py-12 space-y-4 max-w-xl justify-center flex-col items-center mx-8 mt-8 sm:mt-16 sm:mx-auto rounded-lg shadow-lg bg-[#191919]  ">
        <CheckCircleIcon className="w-10 text-secondaryHover h-10 sm:w-12 sm:h-12" />
        <h1 className="text-xl text-center tracking-wide  sm:text-2xl">
          {t("payment:heading")}
        </h1>
        <p className="text-xs sm:text-sm text-center">{t("payment:desc")}</p>
        <p className="text-xs sm:text-sm text-secondary text-center">
          {order_id}
        </p>
        <p className="text-xs sm:text-sm text-center max-w-xs">
          {t("payment:sub_desc")}
        </p>
        <p className="text-xs sm:text-sm text-secondaryHover text-center">
          {customer_email}
        </p>
        <button
          onClick={() => router.push("/")}
          className="border-2 border-secondary hover:border-secondaryHover cursor-pointer  text-white font-bold rounded-lg px-12 py-4"
        >
          {t("payment:goHome")}
        </button>
      </div>
    </main>
  );
}
