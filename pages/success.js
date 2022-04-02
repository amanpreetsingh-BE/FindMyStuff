/* Custom components imports */
import NavReduced from "@components/navbar/NavReduced";
import { useRouter } from "next/router";
/* Icons imports */
import { CheckCircleIcon } from "@heroicons/react/outline";
/* Translate imports */
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { encrypted } from "@root/service-account.enc";

export async function getServerSideProps({ query, locale }) {
  /* AES-258 decipher scheme (base64 -> utf8) to get env variables*/
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

  /* Libs */
  const admin = require("firebase-admin");
  const axios = require("axios");
  const stripe = require("stripe")(env.STRIPE_SECRET_KEY);

  const serviceAccount = JSON.parse(
    Buffer.from(env.SECRET_SERVICE_ACCOUNT, "base64")
  );
  const app = !admin.apps.length
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    : admin.app();

  /* QUERY params */
  const URL_session_id = query.session_id;

  /* Stack */
  let checkoutJSON = null;
  let orderJSON = null;
  let docRef = null;
  let docSnap = null;
  let context = null;
  let template = null;
  let customerMSG = null;
  let adminMSG = null;

  /* Check validity of query param */
  try {
    checkoutJSON = await stripe.checkout.sessions.retrieve(`${URL_session_id}`);
  } catch (err) {
    console.log(err.message); // debug on server
    return {
      notFound: true,
    };
  }

  /* If the checkout session is valid and paid, fetch the order */
  if (checkoutJSON && checkoutJSON.payment_status == "paid") {
    console.log("STRIPE CS : ");
    console.log(checkoutJSON); // insight on server
    if (checkoutJSON.metadata.qrID) {
      docRef = app.firestore().collection("reloads").doc(`${URL_session_id}`);
    } else {
      docRef = app.firestore().collection("orders").doc(`${URL_session_id}`);
    }

    docSnap = await docRef.get();
    try {
      if (docSnap.exists) {
        orderJSON = docSnap.data();
      } else {
        throw Error("No order found in DB :(");
      }
    } catch (err) {
      console.log(err.message); // debug on server
      return {
        notFound: true,
      };
    }

    // If the email confirmation is not sent, do logic else refresh only
    if (!orderJSON.emailSent) {
      if (orderJSON.qrID) {
        // reload order
        context = {
          qrID: orderJSON.qrID,
          quantity: orderJSON.quantity,
          paymentMethod: orderJSON.paymentType,
          email: orderJSON.customer_email,
          orderNumber: orderJSON.order_id,
        };
        template =
          orderJSON.locale ===
          ("fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr")
            ? "d-ce7e57476d68465bacf070c3078607ec"
            : "d-8cbc937813974eeea65200ecd338ab8f";
      } else {
        context = {
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

        template =
          locale === ("fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr")
            ? "d-e9d5aad158834b0d86925e9140733ff8"
            : "d-2714a9e6d65d4e79ad2ba5159ba2f0fa";
      }

      customerMSG = {
        from: {
          email: env.MAIL,
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

      adminMSG = {
        from: {
          email: env.MAIL,
          name: "FindMyStuff",
        },
        template_id: "d-0345b7816de847ddb410396845cd27dc",
        personalizations: [
          {
            to: [
              {
                email: env.MAIL,
              },
            ],
          },
        ],
      };

      try {
        await axios({
          method: "post",
          url: "https://api.sendgrid.com/v3/mail/send",
          headers: {
            Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
          },
          data: customerMSG,
        });

        await axios({
          method: "post",
          url: "https://api.sendgrid.com/v3/mail/send",
          headers: {
            Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
          },
          data: adminMSG,
        });

        await docRef.update({
          emailSent: true,
        });
      } catch (err) {
        console.log(message.err); // debug on server
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
      <div className="flex py-12 space-y-4 max-w-xl justify-center flex-col items-center mx-4 mt-8 sm:mt-16 sm:mx-auto rounded-lg shadow-lg bg-[#191919]  ">
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
