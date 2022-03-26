/* React imports */
import React, { useEffect, useState } from "react";

/* Next imports */
import router from "next/router";
import Image from "next/image";
import Link from "next/link";

/* Firebase components imports */
import { auth } from "@lib/firebase";
import { sendEmailVerification } from "firebase/auth";

/* Custom components imports */
import NavReduced from "@components/navbar/NavReduced";
import AdminLayout from "@components/dashboard/AdminLayout";
import UserLayout from "@components/dashboard/UserLayout";

/* Icons imports */
import { LogoutIcon, RefreshIcon } from "@heroicons/react/outline";

/* Various animations imports */
import toast from "react-hot-toast";

/* Translate imports */
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

/* Cookie handler */
import cookie from "js-cookie";

/* Handle language */
export async function getServerSideProps({ res, req, locale }) {
  /* import admin-sdk firebase to check user */
  const admin = require("firebase-admin");
  const md5 = require("md5"); // used to resend email verification via button
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
  );
  const app = !admin.apps.length
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    : admin.app();

  const firebaseToken = req.cookies.firebaseToken;
  let user = null;
  let userEmail = null;
  let firstName = null;
  let lastName = null;
  let signMethod = null;
  let isAdmin = false;
  let createdAt = null;
  let lastLoginAt = null;
  let uid = null;
  let emailVerified = false;
  let verifySent = false;

  if (firebaseToken) {
    let decodedToken;
    try {
      decodedToken = await app.auth().verifyIdToken(firebaseToken, true);
      user = await app.auth().getUser(decodedToken.uid);
      userEmail = user.email;
      uid = user.uid;
      emailVerified = user.emailVerified;
      const query = app
        .firestore()
        .collection("users")
        .where("email", "==", userEmail);
      const querySnapshot = await query.get();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        firstName = data.firstName;
        lastName = data.lastName;
        verifySent = data.verifySent;
        signMethod = data.signMethod;
        if (doc.data().admin) {
          isAdmin = true;
        } else {
          isAdmin = false;
          createdAt = user.metadata.creationTime;
          lastLoginAt = user.metadata.lastSignInTime;
        }
      });
    } catch (err) {
      console.log(err.message); // debug purpose
      // Corrupted token, try to login again to erase corrupt one
      res.setHeader("location", `${process.env.HOSTNAME}/${locale}/sign`); // connected
      res.statusCode = 302;
      res.end();
      return { props: {} };
    }
  } else {
    // not connected, send to login
    res.setHeader("location", `${process.env.HOSTNAME}/${locale}/sign`);
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  // Get products (read authorized by everyone)
  const products = isAdmin
    ? await fetch(`${process.env.HOSTNAME}/api/products`)
    : null;
  const productsJSON = isAdmin ? await products.json() : null;

  // Get orders
  const orders = isAdmin
    ? await fetch(
        `${process.env.HOSTNAME}/api/orders?authorization=${process.env.SS_API_KEY}`
      )
    : null;
  const ordersJSON = isAdmin ? await orders.json() : null;

  // Get messages
  const messages = isAdmin
    ? await fetch(
        `${process.env.HOSTNAME}/api/messages?authorization=${process.env.SS_API_KEY}`
      )
    : null;
  const messagesJSON = isAdmin ? await messages.json() : null;

  // Get stats
  const stats = isAdmin
    ? await fetch(
        `${process.env.HOSTNAME}/api/statistics?authorization=${process.env.SS_API_KEY}`
      )
    : null;
  const statsJSON = isAdmin ? await stats.json() : null;

  // Get coupons
  const coupons = isAdmin
    ? await fetch(
        `${process.env.HOSTNAME}/api/promo?authorization=${process.env.SS_API_KEY}`
      )
    : null;
  const couponsJSON = isAdmin ? await coupons.json() : null;

  // Get QR to generate
  const qrToGenerate = isAdmin
    ? await fetch(
        `${process.env.HOSTNAME}/api/qr/getQrToGenerate?authorization=${process.env.SS_API_KEY}`
      )
    : null;
  const qrToGenerateJSON = isAdmin ? await qrToGenerate.json() : null;

  // Get potential finders to reward
  const finders = isAdmin
    ? await fetch(
        `${process.env.HOSTNAME}/api/qr/getFinders?authorization=${process.env.SS_API_KEY}`
      )
    : null;
  const findersJSON = isAdmin ? await finders.json() : null;

  // Get user products
  const userProducts = await fetch(
    `${process.env.HOSTNAME}/api/user/products?user=${userEmail}&authorization=${process.env.SS_API_KEY}`
  );
  const userProductsJSON = await userProducts.json();

  // Get user notifications
  const userNotifications = await fetch(
    `${process.env.HOSTNAME}/api/user/notifications?user=${userEmail}&authorization=${process.env.SS_API_KEY}`
  );
  const userNotificationsJSON = await userNotifications.json();

  // hostname (localhost or production)
  const hostname = process.env.HOSTNAME;

  // verify link legit
  const oob = emailVerified ? null : md5(`${uid}${process.env.SS_API_KEY}`);

  // send verification email (if only email sign method), if not sent
  if (!verifySent && signMethod === "email") {
    const template =
      locale === ("fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr")
        ? "d-0aaff71cc7cb4fd597128d669dfe3fd3"
        : "d-6f085881bbd9471d8c5b83e285e798d6";

    const context = {
      url: `${hostname}/verified?oob=${oob}&uid=${uid}`,
      firstName: firstName,
      lastName: lastName,
    };
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
              email: userEmail,
            },
          ],
          dynamic_template_data: context,
        },
      ],
    };
    const axios = require("axios");

    try {
      axios({
        method: "post",
        url: "https://api.sendgrid.com/v3/mail/send",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
        data: msg,
      });
      /* update verify sent, so next refresh it does not send again the verification email */
      var docRef = app.firestore().collection("users").doc(`${uid}`);

      await docRef.update({
        verifySent: true,
      });
    } catch (err) {
      console.log(err.message);
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ["dashboard"])),
      locale,
      productsJSON,
      ordersJSON,
      messagesJSON,
      statsJSON,
      couponsJSON,
      userProductsJSON,
      userNotificationsJSON,
      qrToGenerateJSON,
      findersJSON,
      isAdmin,
      hostname,
      createdAt,
      lastLoginAt,
      emailVerified,
      uid,
      firstName,
      lastName,
      userEmail,
      oob,
    },
  };
}

export default function Dashboard(props) {
  /* Handle language */
  const { t } = useTranslation();

  /* Import image */
  const mailIllustration = require("@images/dashboard/mailConfirm.svg");

  /* Handle resend email verification */
  const [disabledResend, setDisabledResend] = useState(false);

  const resendEmailActivation = async (e) => {
    e.preventDefault();

    if (props.emailVerified) {
      return toast.error(t("dashboard:notVerified:alreadyActivated"));
    } else {
      try {
        setDisabledResend(true); // avoid spam
        await fetch(`${props.hostname}/api/mailer/resend-verify`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: props.uid,
            oob: props.oob,
            locale: props.locale,
            hostname: props.hostname,
            firstName: props.firstName,
            lastName: props.lastName,
            userEmail: props.userEmail,
          }),
        });

        return toast.success(t("dashboard:notVerified:successResend"));
      } catch (error) {
        return toast.error(t("dashboard:notVerified:errorResend"));
      }
    }
  };

  const [showDash, setShowDash] = useState(false);

  useEffect(() => {
    /* Handle popup hello */
    if (
      !cookie.get("showDashFMS") &&
      props.createdAt === props.lastLoginAt &&
      props.emailVerified
    ) {
      var in45Minutes = 1 / 32;
      cookie.set(
        "showDashFMS",
        "Cookie allowing to show or not welcome message",
        { expires: in45Minutes }
      );
      setShowDash(true);
    }
  });

  if (!props.emailVerified) {
    return (
      <main className="bg-primary min-h-screen">
        <NavReduced darkLogo={false} />

        <div className="flex pb-12 max-w-xl justify-center flex-col items-center mx-8 mt-8 sm:mt-16 sm:mx-auto rounded-lg shadow-lg bg-[#191919]  ">
          <Image
            src={mailIllustration}
            priority
            alt="mailConfirm"
            width={264}
            height={264}
          />
          <div className="font-bold text-xl">
            {t("dashboard:notVerified:heading")}
          </div>
          <div className="max-w-sm sm:max-w-lg text-center text-[#FAFAFA] px-12">
            {t("dashboard:notVerified:verifyEmail")}
          </div>
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4  pt-12 text-center text-primary">
            <button
              disabled={disabledResend}
              onClick={resendEmailActivation}
              className="w-60 py-4 font-bold text-white  bg-secondary hover:bg-secondaryHover rounded-lg"
            >
              {t("dashboard:notVerified:resendMsgBtn")}
            </button>

            <button
              onClick={() => router.reload()}
              className="w-60 py-4 flex justify-center items-center font-bold text-white border-2 border-secondary rounded-lg"
            >
              <RefreshIcon className="w-4 h-4 mr-1" />{" "}
              {t("dashboard:notVerified:refresh")}
            </button>
          </div>
        </div>
      </main>
    );
  } else if (props.isAdmin) {
    return (
      <AdminLayout
        useState={useState}
        Image={Image}
        Link={Link}
        toast={toast}
        SignOutButton={SignOutButton}
        firstName={props.firstName}
        lastName={props.astName}
        email={props.userEmail}
        t={t}
        hostname={props.hostname}
        productsJSON={props.productsJSON}
        ordersJSON={props.ordersJSON}
        messagesJSON={props.messagesJSON}
        statsJSON={props.statsJSON}
        couponsJSON={props.couponsJSON}
        qrToGenerateJSON={props.qrToGenerateJSON}
        findersJSON={props.findersJSON}
      />
    );
  } else {
    return (
      <UserLayout
        locale={props.locale}
        useState={useState}
        toast={toast}
        Link={Link}
        Image={Image}
        SignOutButton={SignOutButton}
        firstName={props.firstName}
        lastName={props.lastName}
        email={props.userEmail}
        uid={props.uid}
        hostname={props.hostname}
        showDash={showDash}
        t={t}
        userProductsJSON={props.userProductsJSON}
        userNotificationsJSON={props.userNotificationsJSON}
      />
    );
  }
}

// Sign out button
function SignOutButton() {
  /* Handle language */
  const { t } = useTranslation();

  const signOutAndRedirect = () => {
    auth.signOut();
    router.push("/");
  };
  return (
    <button
      className="text-sm w-full h-full flex flex-row items-center justify-center rounded-lg font-medium hover:text-gray-50 text-white"
      onClick={signOutAndRedirect}
    >
      {" "}
      <LogoutIcon className="w-6 h-6 mr-1" /> {t("dashboard:verified:signout")}
    </button>
  );
}
