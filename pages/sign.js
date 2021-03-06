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
  FacebookAuthProvider,
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

/* Handle language */
export async function getServerSideProps({ res, req, locale }) {
  // hostname (localhost or production)
  const hostname = process.env.HOSTNAME;
  /* import admin-sdk firebase to check user */
  const admin = require("firebase-admin");
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, "base64")
  );
  const app = !admin.apps.length
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    : admin.app();

  const firebaseToken = req.cookies.firebaseToken;

  if (firebaseToken) {
    try {
      await app.auth().verifyIdToken(firebaseToken, true);
      res.setHeader("location", `${hostname}/${locale}/dashboard`); // connected
      res.statusCode = 302;
      res.end();
      return { props: {} };
    } catch (err) {
      // corrupted, try to login again and erase corrupted one
      return {
        props: {
          ...(await serverSideTranslations(locale, ["sign"])),
          locale,
          hostname,
        },
      };
    }
  } else {
    // not connected
    return {
      props: {
        ...(await serverSideTranslations(locale, ["sign"])),
        locale,
        hostname,
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

  // Reset "welcome message" and corrupt token
  useEffect(() => {
    cookie.remove("showDashFMS");
  });

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
      setFormLoading(false);
    } else {
      setFormLoading(true);

      try {
        await signInWithEmailAndPassword(
          auth,
          formEmail.current.value,
          formPassword.current.value
        );
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

      setFormLoading(false);
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
        <div className="bg-white py-8 px-8 mb-8 shadow rounded-xl sm:px-10 text-gray-800">
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
                    {t("sign:signupButtonTxt")}
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
                    {t("sign:signinButtonTxt")}
                  </button>
                </div>

                <div className="w-full text-center border-b-[1px] border-gray-400 leading-[5px]">
                  <span className="bg-white py-2 px-2">{t("sign:or")}</span>
                </div>

                <div className="flex flex-col">
                  <SignInGoogleButton />

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
function SignInGoogleButton() {
  const { t } = useTranslation();
  const router = useRouter();

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
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await manageGoogleUserData(userCredential);
      router.push("/dashboard");
    } catch (err) {
      return toast.error(t("sign:errorSignGoogle"));
    }
  };

  return (
    <button
      type="button"
      className="bg-transparent border-2 border-gray-50 shadow-md hover:bg-gray-50 text-gray-700 w-full py-4 flex items-center justify-center no-underline font-md rounded cursor-pointer mx-auto my-2"
      onClick={signInWithGoogle}
    >
      <Image
        src={"/images/icons/google.png"}
        alt={"logoGoogle"}
        width={20}
        height={20}
      />{" "}
      <span className="ml-2">{t("sign:signInWithGoogle")}</span>
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
