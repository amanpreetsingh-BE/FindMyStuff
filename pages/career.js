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
      ...(await serverSideTranslations(locale, ["career", "home"])),
      locale,
      hostname: env.HOSTNAME,
    },
  };
}

export default function Career({ hostname }) {
  /* Handle language */
  const { t } = useTranslation();

  return (
    <main className="bg-primary h-screen w-full flex flex-col justify-between">
      <div>
        <NavReduced darkLogo={false} />

        <h1 className="text-white text-md md:text-xl font-bold w-1/2 min-w-[300px] max-w-[640px] border-b-4 border-secondary flex items-end justify-end my-16">
          {t("career:heading")}
        </h1>

        <div className="text-white font-extrabold text-md md:text-xl pb-12 flex flex-col items-center justify-center">
          <div className="max-w-xs sm:max-w-sm md:max-w-xl text-center">
            {t("career:desc")}
          </div>

          <div className="w-1/2 h-full flex justify-center items-center my-12">
            <Image
              src={"/images/career/undraw_resume_re_hkth.svg"}
              width={200}
              height={186}
              alt={"graphicsCareer"}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="">
        <FooterSection
          useState={useState}
          t={t}
          Image={Image}
          hostname={hostname}
        />
      </div>
    </main>
  );
}
