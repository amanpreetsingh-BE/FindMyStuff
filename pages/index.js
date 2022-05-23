/* React.js */
import { useState, useEffect } from "react";
/* Next.js */
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
/* Components */
import MobileNav from "@components/navbar/MobileNav";
import Nav from "@components/navbar/Nav";
import HeroSection from "@components/index/HeroSection";
import HiwSectionDesk from "@components/index/HiwSectionDesk";
import HiwSectionMob from "@components/index/HiwSectionMob";
import ProductsSection from "@components/index/ProductsSection";
import ContactSection from "@components/index/ContactSection";
import FooterSection from "@components/index/FooterSection";
/* Animations */
import toast from "react-hot-toast";
import { motion } from "framer-motion";
/* Translation */
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { encrypted } from "@root/service-account.enc";

export async function getServerSideProps({ req, locale }) {
  /* AES-258 decipher scheme (base64 -> utf8) to get env variables*/
  const crypto = require("crypto");
  console.log("HELLO WORLD");
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

  const serviceAccount = JSON.parse(
    Buffer.from(env.SECRET_SERVICE_ACCOUNT, "base64")
  );
  const app = !admin.apps.length
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    : admin.app();

  /* Stack */
  const firebaseToken = req.cookies.firebaseToken;
  let isConnected = null;
  let productsJSON = [];

  /* Check if is connected */
  if (firebaseToken) {
    try {
      await app.auth().verifyIdToken(firebaseToken, true);
      isConnected = true;
    } catch (err) {
      isConnected = false;
    }
  } else {
    isConnected = false;
  }

  /* Fetch products from DB to display for customers */
  try {
    /* KEYCHAINS */
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
    productsJSON = null;
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ["home"])),
      locale,
      productsJSON,
      hostname: env.HOSTNAME,
      isConnected,
    },
  };
}

export default function Home({ locale, productsJSON, hostname, isConnected }) {
  /* handle translations */
  const { t } = useTranslation();

  /* navbar */
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => {
    setIsOpen(!isOpen);
  };
  /* images */
  const separator = require("@images/home/separator.svg");
  /* control window width  */
  const [windowW, setWindowW] = useState("");
  const controlWindow = () => {
    setWindowW(window.innerWidth);
  };
  useEffect(() => {
    setWindowW(window.innerWidth);
    window.addEventListener("resize", controlWindow);
    return () => {
      window.removeEventListener("resize", controlWindow);
    };
  }, []);

  return (
    <div>
      {/* Head SEO */}
      <Head>
        <title>{t("home:seo:title")}</title>
        <meta name="description" content={t("home:seo:description")} />
        <meta name="keywords" content={t("home:seo:description")} />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Nav */}
      <Nav
        Image={Image}
        Link={Link}
        toggle={toggle}
        locale={locale}
        hostname={hostname}
        isConnected={isConnected}
        t={t}
      />
      <MobileNav
        Image={Image}
        Link={Link}
        toggle={toggle}
        isOpen={isOpen}
        hostname={hostname}
        isConnected={isConnected}
        t={t}
      />

      {/* Main part including sections of landing page */}
      <main className="font-nxt">
        {/* Hero Section  */}
        <HeroSection
          motion={motion}
          useState={useState}
          useEffect={useEffect}
          t={t}
          Image={Image}
        />

        {/* How It Works Section  */}
        {windowW <= 840 ? (
          <HiwSectionMob motion={motion} t={t} Image={Image} />
        ) : (
          <HiwSectionDesk
            motion={motion}
            useState={useState}
            useEffect={useEffect}
            t={t}
            Image={Image}
            Script={Script}
          />
        )}
        <div className="flex py-24 sm:py-0 justify-center items-center">
          <iframe
            className="w-[384px] mx-4 h-[217px] sm:w-[560px] sm:h-[315px]"
            src="https://www.youtube.com/embed/G4GwMbNWvCs"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/*Separator */}
        <div className="w-full border-none">
          <svg
            className="flex-no-shrink fill-current"
            id="visual"
            viewBox="0 0 900 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="0" y="0" width="900" height="600" fill="#171C26"></rect>
            <path
              d="M0 153L129 207L257 160L386 185L514 149L643 180L771 236L900 187L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z"
              fill="#171c26"
            ></path>
            <path
              d="M0 136L129 133L257 195L386 125L514 178L643 184L771 160L900 141L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z"
              fill="#161b21"
            ></path>
            <path
              d="M0 157L129 123L257 103L386 90L514 123L643 139L771 127L900 128L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z"
              fill="#16191d"
            ></path>
            <path
              d="M0 104L129 87L257 102L386 60L514 81L643 60L771 86L900 71L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z"
              fill="#161719"
            ></path>
            <path
              d="M0 57L129 46L257 42L386 25L514 35L643 60L771 54L900 55L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z"
              fill="#171717"
            ></path>
          </svg>
        </div>

        {/* Products */}
        <ProductsSection
          hostname={hostname}
          motion={motion}
          toast={toast}
          useState={useState}
          t={t}
          Image={Image}
          productsJSON={productsJSON}
          locale={locale}
        />

        {/* Contact */}
        <ContactSection
          useState={useState}
          hostname={hostname}
          t={t}
          toast={toast}
        />

        {/* Separator */}
        <div className="relative w-full h-[529px] min-h-[529px] bg-primary">
          <Image
            objectFit="cover"
            loading="eager"
            layout="fill"
            src={separator}
            alt="separator"
          />
        </div>

        {/* Footer */}
        <FooterSection
          useState={useState}
          hostname={hostname}
          t={t}
          Image={Image}
        />
      </main>
    </div>
  );
}
