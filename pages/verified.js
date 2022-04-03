/* React imports */
import React, { useEffect } from "react";
/* Next.js */
import router from "next/router";
import Image from "next/image";
/* Custom components imports */
import NavReduced from "@components/navbar/NavReduced";
/* Translation */
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

  /* QUERY params */
  const rx_oob = query.oob;
  const rx_uid = query.uid;

  /* Stack */
  let isItVerified = false;
  const oob = crypto
    .createHash("MD5")
    .update(`${rx_uid}${env.SS_API_KEY}`)
    .digest("hex");

  if (oob === rx_oob) {
    // if the request is legit
    /* import admin-sdk firebase, check if login */
    const admin = require("firebase-admin");
    const serviceAccount = JSON.parse(
      Buffer.from(env.SECRET_SERVICE_ACCOUNT, "base64")
    );
    const app = !admin.apps.length
      ? admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        })
      : admin.app();

    try {
      const user = await app.auth().getUser(rx_uid);
      const emailVerified = user.emailVerified;
      if (emailVerified) {
        isItVerified = true;
      } else {
        const doc = await app
          .firestore()
          .collection("users")
          .doc(`${rx_uid}`)
          .get();
        if (doc.exists) {
          await app.auth().updateUser(rx_uid, { emailVerified: true });
          const userDocRef = app
            .firestore()
            .collection("users")
            .doc(`${rx_uid}`);
          await userDocRef.update({
            verifiedAt: admin.firestore.Timestamp.now().seconds,
          });
        } else {
          console.log("No such document!");
          return {
            notFound: true,
          };
        }
      }
    } catch (err) {
      console.log(err.message); // to debug on Server Side
      return {
        notFound: true,
      };
    }
    return {
      props: {
        ...(await serverSideTranslations(locale, ["verified"])),
        locale,
        hostname: env.HOSTNAME,
        isItVerified,
      },
    };
  } else {
    return {
      notFound: true,
    };
  }
}

export default function VerifyPage({ locale, hostname, isItVerified }) {
  const { t } = useTranslation();
  const illustration = require("@images/verified/go.svg");

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`${hostname}/${locale}/dashboard`);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="bg-primary min-h-screen text-white font-nxt">
      <NavReduced darkLogo={false} />
      <div className="h-screen flex justify-center items-center flex-col -mt-20 pb-20">
        <div className={"relative mx-auto  w-72 h-72 sm:w-96 sm:h-96"}>
          <Image src={illustration} priority={true} layout="fill" alt="ill" />
        </div>
        <div className="mx-20 max-w-md font-bold text-center">
          {isItVerified ? t("verified:alreadyVerified") : t("verified:desc")}
        </div>
      </div>
    </main>
  );
}
