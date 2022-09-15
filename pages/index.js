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
import WhySection from "@components/index/WhySection";
import HiwSectionDesk from "@components/index/HiwSectionDesk";
import HiwSectionMob from "@components/index/HiwSectionMob";
import ProductsSection from "@components/index/ProductsSection";
import ProSection from "@components/index/ProSection";
import ContactSection from "@components/index/ContactSection";
import FooterSection from "@components/index/FooterSection";
import SeenSection from "@components/index/SeenSection";
/* Animations */
import toast from "react-hot-toast";
import { motion } from "framer-motion";
/* Translation */
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { encrypted } from "@root/service-account.enc";
/* Cookie consent */
import CookieConsent from "react-cookie-consent";

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
      analytics: env.ANALYTICS,
      isConnected,
    },
  };
}

export default function Home({
  locale,
  productsJSON,
  hostname,
  analytics,
  isConnected,
}) {
  /* handle translations */
  const { t } = useTranslation();

  /* navbar */
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => {
    setIsOpen(!isOpen);
  };
  /* images */
  //const separator = require("@images/home/separator.svg");
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

      {/* GOOGLE ANALYTICS*/}
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${analytics}`}
      />

      <Script strategy="lazyOnload">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${analytics}', {
        page_path: window.location.pathname,
        });
    `}
      </Script>

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
        {/* Why Section */}
        <WhySection motion={motion} useEffect={useEffect} t={t} Image={Image} />

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

        {/* Video Section */}
        <div className="flex mb-24 bg-primary sm:py-0 flex-col justify-center items-center">
          <div className="py-10 -mt-10 text-white font-bold text-3xl md:text-4xl">
            {t("home:video_heading")}
          </div>
          <iframe
            className="w-3/4 h-96 max-w-2xl"
            src="https://www.youtube.com/embed/G4GwMbNWvCs"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        {/*Separator */}
        <div className="w-full  border-none">
          <svg
            className="flex-no-shrink fill-current"
            id="visual"
            viewBox="0 0 900 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="0" y="0" width="900" height="600" fill="#171717"></rect>
            <path
              d="M0 153L129 207L257 160L386 185L514 149L643 180L771 236L900 187L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z"
              fill="#171717"
            ></path>
            <path
              d="M0 136L129 133L257 195L386 125L514 178L643 184L771 160L900 141L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z"
              fill="#121212"
            ></path>
            <path
              d="M0 157L129 123L257 103L386 90L514 123L643 139L771 127L900 128L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z"
              fill="#101010"
            ></path>
            <path
              d="M0 104L129 87L257 102L386 60L514 81L643 60L771 86L900 71L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z"
              fill="#0C0C0C"
            ></path>
            <path
              d="M0 57L129 46L257 42L386 25L514 35L643 60L771 54L900 55L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z"
              fill="#000"
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
        <ProSection useState={useState} t={t} toast={toast} />
        {/* SeenSection */}
        <SeenSection t={t} Image={Image} motion={motion} />

        {/* Separator 
        <div className="relative w-full h-[530px] ">
          <Image
            objectFit="cover"
            loading="eager"
            layout="fill"
            src={separator}
            alt="separator"
          />
        </div> */}
        {/* Separator */}
        <div className="w-full border-none">
          <svg
            className="flex-no-shrink fill-current"
            id="visual"
            viewBox="0 0 1920 529"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path
                d="M0,336L45.7,356.8C91.3,377.7 182.7,419.3 274.2,423.2C365.7,427 457.3,393 548.8,392.3C640.3,391.7 731.7,424.3 823,411.5C914.3,398.7 1005.7,340.3 1097,322.7C1188.3,305 1279.7,328 1371.2,348.3C1462.7,368.7 1554.3,386.3 1645.8,395.5C1737.3,404.7 1828.7,405.3 1874.3,405.7L1920,406L1920,0L0,0L0,336Z"
                fill="rgb(32,32,32)"
                fillRule="nonzero"
              />
              <path
                d="M0,334L45.7,317.8C91.3,301.7 182.7,269.3 274.2,252C365.7,234.7 457.3,232.3 548.8,245.3C640.3,258.3 731.7,286.7 823,282.5C914.3,278.3 1005.7,241.7 1097,230.2C1188.3,218.7 1279.7,232.3 1371.2,238.7C1462.7,245 1554.3,244 1645.8,262.3C1737.3,280.7 1828.7,318.3 1874.3,337.2L1920,356L1920,0L0,0L0,334Z"
                fill="rgb(95,95,95)"
                fillRule="nonzero"
              />
              <path
                d="M0,187L45.7,192.5C91.3,198 182.7,209 274.2,222.3C365.7,235.7 457.3,251.3 548.8,237.5C640.3,223.7 731.7,180.3 823,178.8C914.3,177.3 1005.7,217.7 1097,233.2C1188.3,248.7 1279.7,239.3 1371.2,218.2C1462.7,197 1554.3,164 1645.8,148C1737.3,132 1828.7,133 1874.3,133.5L1920,134L1920,0L0,0L0,187Z"
                fill="rgb(162,162,162)"
                fillRule="nonzero"
              />
              <path
                d="M0,61L45.7,62.5C91.3,64 182.7,67 274.2,82.2C365.7,97.3 457.3,124.7 548.8,130.5C640.3,136.3 731.7,120.7 823,107.3C914.3,94 1005.7,83 1097,78.3C1188.3,73.7 1279.7,75.3 1371.2,76.2C1462.7,77 1554.3,77 1645.8,85C1737.3,93 1828.7,109 1874.3,117L1920,125L1920,0L0,0L0,61Z"
                fill="rgb(244,244,244)"
                fillRule="nonzero"
              />
            </g>
          </svg>
        </div>

        {/* Footer */}
        <FooterSection
          useState={useState}
          hostname={hostname}
          t={t}
          Image={Image}
        />
        {/* Cookie consent */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <CookieConsent
            debug={true}
            style={{
              background: "#171717",
              opacity: "0.9",
              color: "#F4F4F4",
            }}
            containerClasses={"cookie-container"}
            buttonText={t("home:cookie:buttonText")}
            expires={90}
            buttonStyle={{
              color: "#000",
              padding: "12px 12px",
            }}
            buttonWrapperClasses={"cookie-content"}
          >
            <div className="">
              <div className="text-lg font-bold text-lefg">
                {t("home:cookie:h1")}
              </div>
              <div>
                {t("home:cookie:d1")}
                {t("home:cookie:d2")}
                <a className=" underline" href="/privacy">
                  {t("home:cookie:d3")}
                </a>
              </div>
            </div>
          </CookieConsent>
        </motion.div>
      </main>
    </div>
  );
}
