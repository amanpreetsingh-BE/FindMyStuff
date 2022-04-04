/* React imports */
import React, { useRef, useState, useEffect } from "react";
/* Next imports */
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
/* Import Hero icons */
import { EyeOffIcon, EyeIcon } from "@heroicons/react/solid";
/* Firebase components imports */
import { auth } from "@lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
/* Custom components imports */
import Modal from "@components/misc/Modal";
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

  if (firebaseToken) {
    try {
      await app.auth().verifyIdToken(firebaseToken, true);
      res.setHeader("location", `${env.HOSTNAME}/${locale}/dashboard`); // connected
      res.statusCode = 302;
      res.end();
      return { props: {} };
    } catch (err) {
      // corrupted, try to login again and erase corrupted one
      return {
        props: {
          ...(await serverSideTranslations(locale, ["sign"])),
          locale,
          hostname: env.HOSTNAME,
        },
      };
    }
  } else {
    // not connected
    return {
      props: {
        ...(await serverSideTranslations(locale, ["sign"])),
        locale,
        hostname: env.HOSTNAME,
      },
    };
  }
}

export default function Sign({ locale, hostname }) {
  /* Handle language */
  const { t } = useTranslation();

  /* Used to push to dashboard */
  const router = useRouter();

  /* handle signup or sigin state and loaded user */
  const [signupState, setSignupState] = useState(false);

  /* Handle Modal for forgot pwd */
  const [showModal, setShowModal] = useState(false);
  function openModal() {
    setShowModal((prev) => !prev);
  }
  /* handle form values through ref */
  const formFirstname = useRef();
  const formLastname = useRef();
  const formEmail = useRef();
  const formPassword = useRef();
  const formRepeatPassword = useRef();
  const formForgot = useRef();
  const [isPwdVisible, setIsPwdVisible] = useState(false);
  /* is the form processing ? */
  const [formLoading, setFormLoading] = useState(false);

  /* Import logo */
  const icon_white = require("@images/icons/icon_white.svg");

  /* Sign logic */
  const onSubmit = async (e) => {
    e.preventDefault();
    if (signupState) {
      /* Handle firstname and lastname regex */
      const re = /^[a-zA-Z]*$/;

      setFormLoading(true);

      if (
        !re.test(formFirstname.current.value) ||
        !re.test(formLastname.current.value)
      ) {
        // number and special characters test
        setFormLoading(false);
        return toast.error(t("sign:errorName:specialC"));
      } else if (
        formFirstname.current.value.length > 26 ||
        formLastname.current.value.length > 26
      ) {
        setFormLoading(false);
        return toast.error(t("sign:errorName:tooMuchC"));
      } else if (
        formFirstname.current.value.length < 3 ||
        formLastname.current.value.length < 3
      ) {
        setFormLoading(false);
        return toast.error(t("sign:errorName:tooLowC"));
      } else if (
        formPassword.current.value !== formRepeatPassword.current.value
      ) {
        setFormLoading(false);
        return toast.error(t("sign:errorPwd:notsame"));
      } else if (
        formPassword.current.value.length < 6 ||
        formRepeatPassword.current.value.length < 6
      ) {
        setFormLoading(false);
        return toast.error(t("sign:errorPwd:atleast6"));
      } else {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            formEmail.current.value,
            formPassword.current.value
          );
          const userData = {
            uid: userCredential.user.uid,
            email: formEmail.current.value,
            firstName: formFirstname.current.value,
            lastName: formLastname.current.value,
            signMethod: "email",
            locale: locale,
          };
          const response = await fetch(`/api/user/addInfo`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });
          const responseJSON = await response.json();
          if (responseJSON.error) {
            // error while adding info on user ...
            throw new Error(t("sign:errorMakingAccount"));
          } else {
            const token = await userCredential.user.getIdToken();
            const in45Minutes = 1 / 32;
            cookie.set("firebaseToken", token, { expires: in45Minutes });
            router.push(`/dashboard`);
          }
        } catch (err) {
          if (err.code === "auth/invalid-email") {
            setFormLoading(false);
            return toast.error(t("sign:emailBadlyFormatted"));
          } else if (err.code === "auth/email-already-in-use") {
            setFormLoading(false);
            return toast.error(t("sign:accountAlreadyExist"));
          } else if (err.code === "auth/weak-password") {
            setFormLoading(false);
            return toast.error(t("sign:errorPwd:atleast6"));
          } else {
            setFormLoading(false);
            return toast.error(t("sign:errorMakingAccount"));
          }
        }
      }
    } else {
      setFormLoading(true);
      try {
        console.log(formLoading);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formEmail.current.value,
          formPassword.current.value
        );
        const token = await userCredential.user.getIdToken();
        const in45Minutes = 1 / 32;
        cookie.set("firebaseToken", token, { expires: in45Minutes });
        router.push("/dashboard");
      } catch (err) {
        if (err.code === "auth/user-not-found") {
          setFormLoading(false);
          return toast.error(t("sign:userNotFound"));
        } else {
          setFormLoading(false);
          return toast.error(t("sign:errorLogin"));
        }
      }
    }
  };

  /* Reset pwd logic */
  const resetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/mailer/send-reset`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formForgot.current.value, // check on server
          locale: locale,
          hostname: hostname,
        }),
      });
      const responseJSON = await response.json();
      if (responseJSON.received) {
        setShowModal(false);
        return toast.success(t("sign:forgot:emailSendSuccess"));
      } else {
        throw new Error(t("sign:forgot:emailSendInvalid"));
      }
    } catch (error) {
      setShowModal(false);
      return toast.error(t("sign:forgot:errorEmailSend"));
    }
  };

  return (
    <main className="w-full min-h-screen bg-primary flex flex-col justify-start items-center">
      <div className={`pt-16 pb-4`}>
        <Link passHref href="/">
          <div className="flex justify-center">
            <div className="cursor-pointer relative w-[58px] h-[58px] sm:w-[80px] sm:h-[80px]">
              <Image
                src={icon_white}
                priority
                layout="fill"
                alt="logoReduceds"
              />
            </div>
          </div>
        </Link>
        <div className="space-y-2 pt-4">
          <div className="text-gray-300 text-center font-extrabold text-3xl sm:text-4xl">
            {signupState ? t("sign:signup") : t("sign:signin")}
          </div>
          <div className="text-gray-200 text-center text-xs sm:text-base max-w-xs sm:max-w-md">
            {signupState ? t("sign:account") : t("sign:noAccount")}{" "}
            <span
              className="cursor-pointer text-gray-200 hover:text-white font-bold"
              onClick={() => setSignupState(!signupState)}
            >
              {signupState ? t("sign:signinBtn") : t("sign:signupBtn")}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-xs sm:max-w-lg">
        <div className="bg-white py-6 sm:py-8 px-6 sm:px-10 mb-8 shadow rounded-xl text-gray-800">
          <form className="mb-0 space-y-4" onSubmit={onSubmit}>
            {signupState ? (
              <>
                <div>
                  <label
                    htmlFor="textFirstname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("sign:field:firstname")}
                  </label>
                  <div className="mt-1 ">
                    <input
                      id="textFirstname"
                      name="textFirstname"
                      type="text"
                      ref={formFirstname}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="textLastname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("sign:field:lastname")}
                  </label>
                  <div className="mt-1 ">
                    <input
                      id="textLastname"
                      name="textLastname"
                      type="text"
                      ref={formLastname}
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              ""
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {t("sign:field:email")}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  ref={formEmail}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                {t("sign:field:password")}
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
            </div>

            {signupState ? (
              <>
                <div>
                  <label
                    htmlFor="repeatPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("sign:field:repeatPassword")}
                  </label>
                  <div className="mt-1">
                    <input
                      id="repeatPassword"
                      name="repeatPassword"
                      type="password"
                      ref={formRepeatPassword}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="terms-and-privacy"
                    name="terms-and-privacy"
                    required
                    type="checkbox"
                  />
                  <label
                    htmlFor="terms-and-privacy"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    <span> {t("sign:agree")} </span>
                    <a
                      href="terms"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      {t("sign:terms")}
                    </a>
                    <span> {t("sign:and")} </span>
                    <a
                      href="privacy"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      {t("sign:privacy")}
                    </a>
                  </label>
                </div>

                <div className="flex justify-center w-full">
                  <button
                    disabled={formLoading}
                    className="w-full py-4 font-md text-white text-md bg-gray-700 hover:bg-gray-800 rounded-lg"
                  >
                    {formLoading ? (
                      <div className="flex justify-center items-center">
                        <svg
                          role="status"
                          className="w-8 h-8  text-gray-200 animate-spin dark:text-gray-300 fill-secondary"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                      </div>
                    ) : (
                      t("sign:signupButtonTxt")
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-end text-sm font-bold">
                  <div
                    onClick={openModal}
                    className="cursor-pointer text-gray-500 hover:text-primary"
                  >
                    {t("sign:forgotPassword")}
                  </div>
                  <Modal showModal={showModal} setShowModal={setShowModal}>
                    <div className="flex justify-start px-10 py-24 items-center leading-3 flex-col text-primary">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="text-lg sm:text-lg md:text-xl font-extrabold text-gray-800 text-center">
                          {t("sign:forgot:heading")}
                        </div>
                        <div className="text-xs sm:text-md text-gray-700 max-w-sm text-center leading-4">
                          {t("sign:forgot:desc")}
                        </div>
                        <input
                          id="emailForgot"
                          name="emailForgot"
                          type="email"
                          ref={formForgot}
                        />
                        <button
                          onClick={resetPassword}
                          className="w-full py-4 font-md text-white text-md bg-gray-700 hover:bg-gray-800 rounded-lg"
                        >
                          {t("sign:forgot:rstButtonText")}
                        </button>
                      </div>
                    </div>
                  </Modal>
                </div>

                <div className="flex justify-center">
                  <button
                    disabled={formLoading}
                    className="w-full py-4 font-md text-white text-md bg-gray-700 hover:bg-gray-800 rounded-lg"
                  >
                    {formLoading ? (
                      <div className="flex justify-center items-center">
                        <svg
                          role="status"
                          className="w-8 h-8  text-gray-200 animate-spin dark:text-gray-300 fill-secondary"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                      </div>
                    ) : (
                      t("sign:signinButtonTxt")
                    )}
                  </button>
                </div>

                <div className="w-full text-center border-b-[1px] border-gray-400 leading-[5px]">
                  <span className="bg-white py-2 px-2">{t("sign:or")}</span>
                </div>

                <div className="flex flex-col">
                  <SignInGoogleButton locale={locale} />

                  {/*<SignInFacebookButton />*/}
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

// Sign in with Google button
function SignInGoogleButton({ locale }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  async function manageGoogleUserData(userCredential) {
    let lastName =
      userCredential.user.displayName.split(" ").length == 1
        ? ""
        : userCredential.user.displayName.split(" ")[1];
    const userData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      firstName: userCredential.user.displayName.split(" ")[0],
      lastName: lastName,
      signMethod: "google",
      locale: locale,
    };
    const response = await fetch(`/api/user/addInfo`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const responseJSON = await response.json();
    if (responseJSON.error) {
      // error while adding info on user ...
      throw new Error(t("sign:errorSignGoogle"));
    }
  }

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await manageGoogleUserData(userCredential);
      const token = await userCredential.user.getIdToken();
      const in45Minutes = 1 / 32;
      cookie.set("firebaseToken", token, { expires: in45Minutes });
      router.push("/dashboard");
    } catch (err) {
      setGoogleLoading(false);
      return toast.error(t("sign:errorSignGoogle"));
    }
  };

  return (
    <button
      type="button"
      disabled={googleLoading}
      className="bg-transparent border-2 border-gray-50 shadow-md hover:bg-gray-50 text-gray-700 w-full py-4 flex items-center justify-center no-underline font-md rounded cursor-pointer mx-auto my-2"
      onClick={signInWithGoogle}
    >
      {googleLoading ? (
        <div className="flex justify-center items-center">
          <svg
            role="status"
            className="w-8 h-8  text-gray-200 animate-spin dark:text-gray-300 fill-secondary"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      ) : (
        <>
          <Image
            src={"/images/icons/google.png"}
            alt={"logoGoogle"}
            width={20}
            height={20}
          />{" "}
          <span className="ml-2">{t("sign:signInWithGoogle")}</span>
        </>
      )}
    </button>
  );
}

// Sign in with Facebook button
/*function SignInFacebookButton() {
  const { t } = useTranslation();
  const router = useRouter();

  async function manageFacebookUserData(userCredential) {
    let lastName =
      userCredential.user.displayName.split(" ").length == 1
        ? ""
        : userCredential.user.displayName.split(" ")[1];

    const response = await fetch(`/api/user/addInfo`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        firstName: userCredential.user.displayName.split(" ")[0],
        lastName: lastName,
        signMethod: "facebook",
      }),
    });
    const responseJSON = await response.json();
    if (responseJSON.error) {
      // error while adding info on user ...
      throw new Error(t("sign:errorSignFb"));
    }
  }

  const signInWithFacebook = async () => {
    const facebookProvider = new FacebookAuthProvider();
    facebookProvider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const userCredential = await signInWithPopup(auth, facebookProvider);
      await manageFacebookUserData(userCredential);
      router.push("/dashboard");
    } catch (err) {
      return toast.error(t("sign:errorSignFb"));
    }
  };

  return (
    <button
      type="button"
      className="bg-facebook shadow-md hover:bg-facebookHover border-none text-white w-full py-4 flex items-center justify-center no-underline font-md rounded cursor-pointer mx-auto my-2"
      onClick={signInWithFacebook}
    >
      <Image
        src={"/images/icons/f_logo_RGB-White_512.png"}
        alt={"logoFacebook"}
        width={20}
        height={20}
      />{" "}
      <span className="ml-2">{t("sign:signInWithFacebook")}</span>
    </button>
  );
}*/
