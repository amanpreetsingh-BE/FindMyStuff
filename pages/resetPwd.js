/* React imports */
import React, { useState, useRef } from "react";
/* Next.js */
import router from "next/router";
import Image from "next/image";
/* Custom components imports */
import NavReduced from "@components/navbar/NavReduced";
/* Translation */
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
/* Import Hero icons */
import { EyeOffIcon, EyeIcon } from "@heroicons/react/solid";
/* Animations */
import toast from "react-hot-toast";

export async function getServerSideProps({ query, req, locale }) {
  /* Get host (local or dev) */
  const hostname = process.env.HOSTNAME;
  const md5 = require("md5"); // used to check oob
  const oob = query.oob;
  const uid = query.uid;

  if (oob === md5(`${uid}${process.env.SS_API_KEY}`)) {
    return {
      props: {
        ...(await serverSideTranslations(locale, ["resetPwd"])),
        locale,
        hostname,
        oob,
        uid,
      },
    };
  } else {
    return {
      notFound: true,
    };
  }
}

export default function ResetPwdPage({ locale, hostname, oob, uid }) {
  const { t } = useTranslation();
  const [isPwdVisible, setIsPwdVisible] = useState(false);
  const [isPwdVisible2, setIsPwdVisible2] = useState(false);
  const formPassword = useRef();
  const formRepeatPassword = useRef();
  /* is processing ? */
  const [loading, setLoading] = useState(false);

  /* Import image */
  const resetIllustration = require("@images/resetPwd/illustration.svg");

  const reset = async () => {
    setLoading(true);
    if (formPassword.current.value !== formRepeatPassword.current.value) {
      setLoading(false);
      return toast.error(t("resetPwd:notsame"));
    } else if (
      formPassword.current.value.length < 6 ||
      formRepeatPassword.current.value.length < 6
    ) {
      setLoading(false);
      return toast.error(t("resetPwd:atleast6"));
    } else {
      try {
        await fetch(`/api/user/resetPwd`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: uid,
            oob: oob,
            newPwd: formPassword.current.value,
            newPwdRepeat: formRepeatPassword.current.value, // to check in Server ..
          }),
        });
        toast.success(t("resetPwd:successReset"));
        router.push(`${hostname}/${locale}/sign`);
      } catch (error) {
        setLoading(false);
        return toast.error(t("resetPwd:errorReset"));
      }
    }
  };
  return (
    <main className="bg-primary min-h-screen">
      <NavReduced darkLogo={false} />

      <div className="flex pb-12 max-w-xl justify-center flex-col items-center mx-8 my-4 sm:my-8 sm:mx-auto rounded-lg shadow-lg bg-[#191919]  ">
        <Image
          src={resetIllustration}
          priority
          alt="mailConfirm"
          width={264}
          height={264}
        />
        <div className="font-bold pb-8 text-2xl">{t("resetPwd:heading")}</div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-200"
          >
            {t("resetPwd:in1")}
          </label>
          <div className="relative mt-1">
            {isPwdVisible ? (
              <EyeIcon
                onClick={() => setIsPwdVisible(false)}
                className="absolute cursor-pointer text-gray-600 top-3 right-3 w-5 h-5"
              />
            ) : (
              <EyeOffIcon
                onClick={() => setIsPwdVisible(true)}
                className="absolute cursor-pointer text-gray-600 top-3 right-3 w-5 h-5"
              />
            )}
            <input
              id="password"
              name="password"
              type={isPwdVisible ? "text" : "password"}
              autoComplete="password"
              ref={formPassword}
              required
            />
          </div>

          <div>
            <label
              htmlFor="repeatPassword"
              className="block text-sm font-medium text-gray-200  pt-4"
            >
              {t("resetPwd:in2")}
            </label>
            <div className="relative mt-1">
              {isPwdVisible2 ? (
                <EyeIcon
                  onClick={() => setIsPwdVisible2(false)}
                  className="absolute cursor-pointer text-gray-600 top-3 right-3 w-5 h-5"
                />
              ) : (
                <EyeOffIcon
                  onClick={() => setIsPwdVisible2(true)}
                  className="absolute cursor-pointer text-gray-600 top-3 right-3 w-5 h-5"
                />
              )}
              <input
                id="repeatPassword"
                name="repeatPassword"
                type={isPwdVisible2 ? "text" : "password"}
                autoComplete="password"
                ref={formRepeatPassword}
                required
              />
            </div>
          </div>
        </div>
        <button
          disabled={loading}
          onClick={() => reset()}
          className="w-60 my-12 py-4 flex justify-center items-center font-bold text-white border-2 border-secondary rounded-lg"
        >
          {t("resetPwd:confirm")}
        </button>
      </div>
    </main>
  );
}
