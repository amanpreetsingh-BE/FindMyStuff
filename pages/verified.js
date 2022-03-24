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

export async function getServerSideProps({ query, req, locale }) {
  /* Get host (local or dev) */
  const hostname = process.env.HOSTNAME;
  const md5 = require("md5"); // used to check oob
  const oob = query.oob;
  const uid = query.uid;
  let isItVerified = false;

  if (oob === md5(`${uid}${process.env.SS_API_KEY}`)) {
    // if the request is legit
    /* import admin-sdk firebase, check if login */
    const admin = require("firebase-admin");
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
    );
    const app = !admin.apps.length
      ? admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        })
      : admin.app();

    try {
      const user = await app.auth().getUser(uid);
      const emailVerified = user.emailVerified;
      if (emailVerified) {
        isItVerified = true;
      } else {
        const doc = await app
          .firestore()
          .collection("users")
          .doc(`${uid}`)
          .get();
        if (doc.exists) {
          await app.auth().updateUser(uid, { emailVerified: true });
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
        hostname,
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
