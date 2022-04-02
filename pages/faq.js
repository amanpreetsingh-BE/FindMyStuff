/* React.js */
import { useState } from "react";
/* Next imports */
import Image from "next/image";
/* Custom components imports */
import NavReduced from "@components/navbar/NavReduced";
import FooterSection from "@components/index/FooterSection";
/* Translate imports */
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { encrypted } from "@root/service-account.enc";

export async function getServerSideProps({ locale }) {
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

  return {
    props: {
      ...(await serverSideTranslations(locale, ["faq", "home"])),
      locale,
      hostname: env.HOSTNAME,
    },
  };
}

export default function Faq({ hostname }) {
  /* Handle language */
  const { t } = useTranslation();

  return (
    <main className="bg-primary text-white min-h-screen">
      <NavReduced darkLogo={false} />
      <div className="">
        <h1 className="font-bold md:text-xl w-1/3 min-w-[300px] max-w-[640px] border-b-4 border-secondary flex items-end justify-end my-16">
          {t("faq:heading")}
        </h1>
        <h2 className="mx-12 my-4 bg-[#1B212E] rounded-lg sm:text-lg font-semibold py-3 px-3">
          {t("faq:q1")}
        </h2>
        <p className="text-base font-medium my-3 mx-14">{t("faq:a1")}</p>

        <h2 className="mx-12 my-4 bg-[#1B212E] rounded-lg sm:text-lg font-semibold py-3 px-3">
          {t("faq:q2")}
        </h2>
        <p className="text-base font-medium my-3 mx-14">{t("faq:a2")}</p>

        <h2 className="mx-12 my-4 bg-[#1B212E] rounded-lg sm:text-lg font-semibold py-3 px-3">
          {t("faq:q3")}
        </h2>
        <p className="text-base font-medium my-3 mx-14">{t("faq:a3")}</p>

        <h2 className="mx-12 my-4 bg-[#1B212E] rounded-lg sm:text-lg font-semibold py-3 px-3">
          {t("faq:q4")}
        </h2>
        <p className="text-base font-medium my-3 mx-14">{t("faq:a4")}</p>

        <h2 className="mx-12 my-4 bg-[#1B212E] rounded-lg sm:text-lg font-semibold py-3 px-3">
          {t("faq:q5")}
        </h2>
        <p className="text-base font-medium my-3 mx-14">{t("faq:a5")}</p>

        <h2 className="mx-12 my-4 bg-[#1B212E] rounded-lg sm:text-lg font-semibold py-3 px-3">
          {t("faq:q6")}
        </h2>
        <p className="text-base font-medium my-3 mx-14">{t("faq:a6")}</p>

        <h2 className="mx-12 my-4 bg-[#1B212E] rounded-lg sm:text-lg font-semibold py-3 px-3">
          {t("faq:q7")}
        </h2>
        <p className="text-base font-medium my-3 mx-14">{t("faq:a7")}</p>

        <h2 className="mx-12 my-4 bg-[#1B212E] rounded-lg sm:text-lg font-semibold py-3 px-3">
          {t("faq:q8")}
        </h2>
        <p className="text-base font-medium my-3 mx-14">{t("faq:a8")}</p>

        <h2 className="mx-12 my-4 bg-[#1B212E] rounded-lg sm:text-lg font-semibold py-3 px-3">
          {t("faq:q9")}
        </h2>
        <p className="text-base font-medium my-3 mx-14">{t("faq:a9")}</p>

        <h2 className="mx-12 my-4 bg-[#1B212E] rounded-lg sm:text-lg font-semibold py-3 px-3">
          {t("faq:q10")}
        </h2>
        <p className="text-base font-medium my-3 mx-14">{t("faq:a10")}</p>

        <h2 className="mx-12 my-4 bg-[#1B212E] rounded-lg sm:text-lg font-semibold py-3 px-3">
          {t("faq:q11")}
        </h2>
        <p className="text-base font-medium mt-3 mx-14 pb-16">{t("faq:a11")}</p>
      </div>
      {/* Footer */}
      <FooterSection
        useState={useState}
        t={t}
        Image={Image}
        hostname={hostname}
      />
    </main>
  );
}
