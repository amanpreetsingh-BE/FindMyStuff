/* React imports */
import React, { useEffect, useState } from "react";
/* Next imports */
import router from "next/router";
import Image from "next/image";
import Link from "next/link";
/* Firebase components imports */
import { auth } from "@lib/firebase";
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
import { encrypted } from "@root/service-account.enc";

export async function getServerSideProps({ res, req, locale }) {
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

  const serviceAccount = JSON.parse(
    Buffer.from(env.SECRET_SERVICE_ACCOUNT, "base64")
  );
  const app = !admin.apps.length
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    : admin.app();

  /* User Stack */
  const firebaseToken = req.cookies.firebaseToken;
  let user = null;
  let userData = null;
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

  /* Check if user is connected */
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
        userData = doc.data();
        firstName = userData.firstName;
        lastName = userData.lastName;
        verifySent = userData.verifySent;
        signMethod = userData.signMethod;
        if (userData.admin) {
          isAdmin = true;
        } else {
          isAdmin = false;
          createdAt = user.metadata.creationTime;
          lastLoginAt = user.metadata.lastSignInTime;
        }
      });
    } catch (err) {
      console.log(err.message); // debug on server
      // Corrupted token, try to login again to erase corrupt one
      res.setHeader("location", `${env.HOSTNAME}/${locale}/sign`); // connected
      res.statusCode = 302;
      res.end();
      return { props: {} };
    }
  } else {
    // not connected, send to login
    res.setHeader("location", `${env.HOSTNAME}/${locale}/sign`);
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  /* Admin and User Stack */
  let productsJSON = [];
  let ordersJSON = [];
  let messagesJSON = [];
  let statsJSON = null;
  let couponsJSON = [];
  let qrToGenerateJSON = [];
  let findersJSON = [];
  let userProductsJSON = [];
  let userNotificationsJSON = [];
  let authorization = null;
  let oob = null;

  if (isAdmin) {
    // ADMIN
    /* GET PRODUCTS */
    try {
      var keychainRef = app.firestore().collection("products/Keychain/id/");
      const keychainSnapshot = await keychainRef.get();
      const keychainsID = [];
      const keychains = [];
      keychainSnapshot.forEach((keychainDoc) => {
        keychainsID.push(keychainDoc.id);
      });
      for (let i = 0; i < keychainsID.length; i++) {
        var colorRef = app
          .firestore()
          .collection(`products/Keychain/id/${keychainsID[i]}/colors/`);
        const colorSnapshot = await colorRef.get();
        const colors = [];
        colorSnapshot.forEach((colorDoc) => {
          colors.push(colorDoc.data());
        });
        keychains.push({
          id: keychainsID[i],
          colors: colors,
        });
      }

      /* STICKERS */
      var StickerRef = app.firestore().collection("products/Sticker/id");
      const stickerSnapshot = await StickerRef.get();

      const stickers = [];

      stickerSnapshot.forEach((stickerDoc) => {
        stickers.push({
          id: stickerDoc.id,
          data: stickerDoc.data(),
        });
      });

      /* TRACKERS */
      var TrackerRef = app.firestore().collection("products/Tracker/id");
      const trackerSnapshot = await TrackerRef.get();

      const trackers = [];

      trackerSnapshot.forEach((trackerDoc) => {
        trackers.push({
          id: trackerDoc.id,
          data: trackerDoc.data(),
        });
      });

      /* OTHERS */
      var OtherRef = app.firestore().collection("products/Other/id");
      const OtherSnapshot = await OtherRef.get();

      const others = [];

      OtherSnapshot.forEach((otherDoc) => {
        others.push({
          id: otherDoc.id,
          data: otherDoc.data(),
        });
      });

      keychains.reverse();
      productsJSON.push(keychains);
      productsJSON.push(stickers);
      productsJSON.push(trackers);
      productsJSON.push(others);
    } catch (err) {
      console.log(err.message); // debug on server
      productsJSON = null;
    }

    /* GET ORDERS */
    try {
      const query = app
        .firestore()
        .collection("orders")
        .orderBy("timestamp", "desc");
      const snapshot = await query.get();
      snapshot.forEach((doc) => {
        ordersJSON.push(doc.data());
      });
    } catch (err) {
      console.log(err.message); // debug on server
      ordersJSON = null;
    }

    /* GET MESSAGES */
    try {
      const query = app
        .firestore()
        .collection("messages")
        .orderBy("timestamp", "desc");
      const snapshot = await query.get();
      snapshot.forEach((doc) => {
        messagesJSON.push(doc.data());
      });
    } catch (err) {
      console.log(err.message); // debug on server
      messagesJSON = null;
    }

    /* GET STATS */
    try {
      var usersRef = app.firestore().collection("users");
      const users = await usersRef.get();
      const usersNum = users.size;
      var ordersRef = app.firestore().collection("orders");
      const orders = await ordersRef.get();
      const ordersNum = orders.size;
      var msgRef = app.firestore().collection("messages");
      const msg = await msgRef.get();
      const msgNum = msg.size;
      statsJSON = {
        ordersNum: ordersNum,
        usersNum: usersNum,
        msgNum: msgNum,
      };
    } catch (err) {
      console.log(err.message); // debug on server
      statsJSON = null;
    }

    /* GET COUPONS */
    try {
      var couponsRef = app.firestore().collection("coupons");
      const couponsSnapshot = await couponsRef.get();
      couponsSnapshot.forEach((doc) => {
        couponsJSON.push(doc.data());
      });
    } catch (err) {
      console.log(err.message); // debug on server
      couponsJSON = null;
    }

    /* GET QR TO GENERATE */
    try {
      const querySnapshot = await app
        .firestore()
        .collection("QR")
        .where("needToGenerate", "==", true)
        .get();
      querySnapshot.forEach((doc) => {
        qrToGenerateJSON.push({ data: doc.data(), id: doc.id });
      });
    } catch (err) {
      console.log(err.message); // debug on server
      qrToGenerateJSON = null;
    }

    /* GET FINDERS TO REWARD */
    try {
      var findersRef = app.firestore().collection("finders");
      const findersSnapshot = await findersRef.get();
      findersSnapshot.forEach((doc) => {
        findersJSON.push(doc.data());
      });
    } catch (err) {
      console.log(err.message); // debug on server
      findersJSON = null;
    }

    /* GET AUTHORIZATION hash */
    authorization = crypto
      .createHash("MD5")
      .update(`${env.SS_API_KEY}`)
      .digest("hex");
  } else {
    // USER

    /* GET USER PRODUCTS */
    try {
      const querySnapshot = await app
        .firestore()
        .collection("QR")
        .where("email", "==", userEmail)
        .get();
      querySnapshot.forEach((doc) => {
        userProductsJSON.push({ id: doc.id, data: doc.data() });
      });
    } catch (err) {
      console.log(err.message); // debug on server
      userProductsJSON = null;
    }

    /* GET USER NOTIFICATIONS */
    try {
      const querySnapshot = await app
        .firestore()
        .collection("notifications")
        .where("email", "==", userEmail)
        .get();
      querySnapshot.forEach((doc) => {
        var i = doc.id;
        var s = doc.data().scan ? doc.data().scan : null;
        var d = doc.data().delivery ? doc.data().delivery : null;
        userNotificationsJSON.push({ id: i, scan: s, delivery: d });
      });
    } catch (err) {
      console.log(err.message); // debug on server
      userNotificationsJSON = null;
    }

    // allow to sign a request of the profile
    oob = crypto
      .createHash("MD5")
      .update(`${uid}${env.SS_API_KEY}`)
      .digest("hex");
  }

  /* Never send an confirmation email to a verified, normally never happened */
  if (signMethod != "email" && !emailVerified) {
    await app.auth().updateUser(uid, { emailVerified: true });
    var docRef = app.firestore().collection("users").doc(`${uid}`);

    await docRef.update({
      verifySent: true,
    });
  }

  // send verification email (if only email sign method), if not sent
  if (signMethod === "email" && !verifySent) {
    const template =
      locale === ("fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr")
        ? "d-0aaff71cc7cb4fd597128d669dfe3fd3"
        : "d-6f085881bbd9471d8c5b83e285e798d6";

    const context = {
      url: `${env.HOSTNAME}/verified?oob=${oob}&uid=${uid}`,
      firstName: firstName,
      lastName: lastName,
    };
    const msg = {
      from: {
        email: env.MAIL,
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

    try {
      await axios({
        method: "post",
        url: "https://api.sendgrid.com/v3/mail/send",
        headers: {
          Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
        },
        data: msg,
      });

      /* update verify sent, so next refresh it does not send again the verification email */
      var docRef = app.firestore().collection("users").doc(`${uid}`);

      await docRef.update({
        verifySent: true,
      });
    } catch (err) {
      console.log(err.message); // debug on server
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
      hostname: env.HOSTNAME,
      createdAt,
      lastLoginAt,
      emailVerified,
      uid,
      firstName,
      lastName,
      userEmail,
      oob,
      authorization,
      signMethod,
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
        await fetch(`/api/mailer/send-verify`, {
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
        locale={props.locale}
        authorization={props.authorization}
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
        oob={props.oob}
        signMethod={props.signMethod}
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
    cookie.remove("firebaseToken");
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
