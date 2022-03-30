/* React imports */
import React, { useState, useEffect, useRef } from "react";
/* Translate imports */
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
/* Built-in Next.js imports */
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { EyeOffIcon, EyeIcon } from "@heroicons/react/solid";

import Map from "@components/Map";
import { Document, Page, pdfjs } from "react-pdf";

import zipJSON from "@root/public/misc/zipcode-belgium.json";
import { LocationMarkerIcon } from "@heroicons/react/outline";

/* Firebase components imports */
import { auth } from "@lib/firebase";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Timestamp } from "firebase/firestore";

/* Custom components imports */
import Modal from "@components/misc/Modal";

/* Various animations imports */
import toast from "react-hot-toast";
import { ArrowCircleLeftIcon } from "@heroicons/react/outline";

/* Handle language */
export async function getServerSideProps({ params, locale }) {
  const id = params.id;
  const hostname = process.env.HOSTNAME;
  const md5 = require("md5"); // used to check oob
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

  let activate = false;
  let jetons = null;
  let relais = null;
  let timestamp = null;
  let pdf = null;
  let oob = null;
  let userEmail = null;
  try {
    const docSnapshot = await app.firestore().collection("QR").doc(id).get();
    if (docSnapshot.exists) {
      // valid QR ; FETCH data
      console.log("VALID QR");
      const data = docSnapshot.data();
      activate = data.activate;
      userEmail = data.email;
      relais = data.relais;
      jetons = data.jetons;
      timestamp = data.timestamp;
      pdf = data.pdf;
      oob = md5(`${id}${process.env.SS_API_KEY}`);
      // Notify the user of scan found if activated and loaded
      if (activate && jetons >= 1) {
        console.log("ACTIVATED QR");
        const notifRef = app.firestore().collection("notifications").doc(id);
        const docNotifRef = await notifRef.get();
        if (docNotifRef.exists) {
          var s = docNotifRef.data().scan;
          s.push({ timestamp: admin.firestore.Timestamp.now().seconds });
          await notifRef.update({
            scan: s,
          });
          console.log("add notif");
        } else {
          var s = [];
          s.push({ timestamp: admin.firestore.Timestamp.now().seconds });
          await app.firestore().collection("notifications").doc(id).set({
            id: id,
            email: userEmail,
            scan: s,
            delivery: [],
          });
          console.log("add first notif");
        }
      }

      return {
        props: {
          ...(await serverSideTranslations(locale, ["scan"])),
          locale,
          id,
          activate,
          jetons,
          relais,
          timestamp,
          hostname,
          oob,
          pdf,
        },
      };
    } else {
      console.log("NOT VALID QR");
      return {
        notFound: true, // not a valid QR
      };
    }
  } catch (err) {
    console.log(err.message); // to debug on server, error with firebase
    return {
      notFound: true,
    };
  }
}

export default function ScanPage({
  id,
  activate,
  timestamp,
  jetons,
  relais,
  hostname,
  locale,
  oob,
  pdf,
}) {
  /* Handle language */
  const { t } = useTranslation();

  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  /* Import images */
  const jetonsLogo = require("@images/scan/jeton.svg");
  const uncomplete = require("@images/scan/uncomplete2.svg");
  const icon = require("@images/icons/icon_white.svg");
  const en_flag = require("@images/icons/gb.svg");
  const fr_flag = require("@images/icons/fr.svg");
  const animatedFound = require("@images/scan/animatedFounNoLoopBlue.gif");
  const [step, setStep] = useState(0);

  /* handle signup or sigin state and loaded user */
  const [signupState, setSignupState] = useState(true);

  /* Used to push to dashboard */
  const router = useRouter();

  /* handle form values through ref */
  const [formLoading, setFormLoading] = useState(false);
  const [isPwdVisible, setIsPwdVisible] = useState(false);
  const formFirstname = useRef();
  const formLastname = useRef();
  const formEmail = useRef();
  const formPassword = useRef();
  const formRepeatPassword = useRef();
  const formForgot = useRef();

  const [show, setShow] = useState(true);
  const [checked, setChecked] = useState(true);
  const [generating, setGenerating] = useState(false);
  const fullName = useRef();
  const iban = useRef();

  const delay = 3;
  useEffect(() => {
    let timer1 = setTimeout(() => setShow(false), delay * 1000);
    return () => {
      clearTimeout(timer1);
    };
  }, []);

  const cp = useRef();
  const [center, setCenter] = useState([50.85034, 4.35171]);
  const [listPt, setListPt] = useState(null);
  const [selected, setSelected] = useState(false);
  const [selection, setSelection] = useState("");

  /* Handle Modal for forgot pwd */
  const [showModal, setShowModal] = useState(false);
  function openModal() {
    setShowModal((prev) => !prev);
  }

  const handleRegister = async (id, email) => {
    const data = {
      id: id,
      email: email,
      oob: oob,
    };

    try {
      const response = await fetch(`/api/qr/activate`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseJSON = await response.json();
      if (responseJSON.success) {
        return toast.success(t("scan:successQRregister"));
      }
    } catch (err) {
      return toast.error(t("scan:failureQRregister"));
    }
  };

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
        return toast.error(t("scan:errorName:specialC"));
      } else if (
        formFirstname.current.value.length > 26 ||
        formLastname.current.value.length > 26
      ) {
        setFormLoading(false);
        return toast.error(t("scan:errorName:tooMuchC"));
      } else if (
        formFirstname.current.value.length < 3 ||
        formLastname.current.value.length < 3
      ) {
        setFormLoading(false);
        return toast.error(t("scan:errorName:tooLowC"));
      } else if (
        formPassword.current.value !== formRepeatPassword.current.value
      ) {
        setFormLoading(false);
        return toast.error(t("scan:errorPwd:notsame"));
      } else if (
        formPassword.current.value.length < 6 ||
        formRepeatPassword.current.value.length < 6
      ) {
        setFormLoading(false);
        return toast.error(t("scan:errorPwd:atleast6"));
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
            throw new Error(t("scan:errorMakingAccount"));
          }

          await handleRegister(id, formEmail.current.value);
          router.push(`${hostname}/${locale}/scan/select/${id}`);
        } catch (err) {
          if (err.code === "auth/invalid-email") {
            setFormLoading(false);
            return toast.error(t("scan:emailBadlyFormatted"));
          } else if (err.code === "auth/email-already-in-use") {
            setFormLoading(false);
            return toast.error(t("scan:accountAlreadyExist"));
          } else if (err.code === "auth/weak-password") {
            setFormLoading(false);
            return toast.error(t("scan:errorPwd:atleast6"));
          } else {
            setFormLoading(false);
            return toast.error(t("scan:errorLogin"));
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
        await handleRegister(id, formEmail.current.value);
        router.push(`${hostname}/scan/select/${id}`);
      } catch (err) {
        if (err.code === "auth/user-not-found") {
          setFormLoading(false);
          return toast.error(t("scan:userNotFound"));
        } else {
          setFormLoading(false);
          return toast.error(t("scan:errorLogin"));
        }
      }

      setFormLoading(false);
    }
  };

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
      if (responseJSON.error) {
        throw new Error(t("scan:forgot:emailSendInvalid"));
      } else {
        setShowModal(false);
        return toast.success(t("scan:forgot:emailSendSuccess"));
      }
    } catch (error) {
      setShowModal(false);
      return toast.error(t("scan:forgot:errorEmailSend"));
    }
  };

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    setGenerating(true);
    const re = /^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/;

    if (
      !checked &&
      (fullName.current.value == "" || iban.current.value == "")
    ) {
      setGenerating(false);
      return toast.error(t("scan:found:errorRew"));
    } else if (
      !checked &&
      iban.current.value.substr(0, 2) != "BE" &&
      iban.current.value.substr(0, 2) != "be" &&
      iban.current.value.length != 16
    ) {
      setGenerating(false);
      return toast.error(t("scan:found:errorIBAN"));
    } else if (!checked && !re.test(fullName.current.value)) {
      setGenerating(false);
      return toast.error(t("scan:errorName:specialC"));
    } else if (!checked && fullName.current.value.length > 26) {
      setGenerating(false);
      return toast.error(t("scan:errorName:tooMuchC"));
    } else if (!checked && fullName.current.value.length < 3) {
      setGenerating(false);
      return toast.error(t("scan:errorName:tooLowC"));
    } else {
      // checked false
      const exp = 2505600;
      let data = null;

      if (timestamp && Timestamp.now().seconds < timestamp + exp) {
        data = {
          fullName: checked ? "" : fullName.current.value,
          iban: checked ? "" : iban.current.value,
          id: id,
          expire: false,
          timestamp: timestamp,
          donation: checked,
          oob: oob,
        };
      } else if (timestamp && Timestamp.now().seconds >= timestamp + exp) {
        data = {
          fullName: checked ? "" : fullName.current.value,
          iban: checked ? "" : iban.current.value,
          id: id,
          expire: true,
          timestamp: timestamp,
          donation: checked,
          oob: oob,
        };
      } else {
        data = {
          fullName: checked ? "" : fullName.current.value,
          iban: checked ? "" : iban.current.value,
          id: id,
          expire: null,
          timestamp: timestamp,
          donation: checked,
          oob: oob,
        };
      }
      try {
        const response = await fetch(`/api/qr/handleGenerate`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const responseJSON = await response.json();
        if (responseJSON.success) {
          setGenerating(false);
          setStep(2);
          return toast.success(t("scan:successQRGeneration"));
        }
      } catch (err) {
        setGenerating(false);
        return toast.error(t("scan:failureQRGeneration"));
      }
    }
  };

  function generateMarker(Marker, Popup) {
    var result = [];
    var iter = 0;
    listPt.forEach((element) => {
      var heading = element.LgAdr1[0];
      var code = element.CP[0];
      var street = element.LgAdr3[0];
      var urlPhoto = element.URL_Photo[0];
      var Num = element.Num[0];

      result.push(
        <Marker
          key={iter}
          position={[
            element.Latitude[0].replace(/,/g, "."),
            element.Longitude[0].replace(/,/g, "."),
          ]}
          eventHandlers={{
            click: (e) => {
              setSelection({
                heading: heading,
                street: street,
                code: code,
                urlPhoto: urlPhoto,
                num: Num,
              });
            },
          }}
        >
          <Popup>
            <div className="text-lg font-bold max-w-[150px]">{heading}</div>
            <div className="text-sm font-md max-w-[150px]">
              <b>{t("scan:select:popupStreet")}</b> {street}
            </div>
            <div className="text-sm font-md pb-2">
              <b>{t("scan:select:popupCode")}</b> {code}
            </div>
            <div className="flex justify-left items-center">
              <Image src={urlPhoto} width={150} height={150} />
            </div>
          </Popup>
        </Marker>
      );
      iter = iter + 1;
    });
    return result;
  }

  const handleLoc = async (e) => {
    e.preventDefault();
    try {
      const data = {
        cp: cp.current.value,
        id: id,
        oob: oob,
      };
      const response = await fetch(`/api/qr/findPointByCP`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseJSON = await response.json();
      setListPt(
        responseJSON["soap:Envelope"]["soap:Body"][0][
          "WSI4_PointRelais_RechercheResponse"
        ][0]["WSI4_PointRelais_RechercheResult"][0].PointsRelais[0]
          .PointRelais_Details
      );
      setCenter([
        zipJSON.filter(({ zip }) => zip === cp.current.value)[0].lat,
        zipJSON.filter(({ zip }) => zip === cp.current.value)[0].lng,
      ]);
      setSelected(true);
    } catch (err) {
      return toast.error(t("scan:select:errLoc"));
    }
  };

  function LanguageBox(id, locale, fr_flag, en_flag, select) {
    const flag = locale === "en" ? en_flag : fr_flag;
    const pathEN = select
      ? `${hostname}/en/scan/select/${id}`
      : `${hostname}/en/scan/${id}`;
    const pathFR = select
      ? `${hostname}/fr/scan/select/${id}`
      : `${hostname}/fr/scan/${id}`;

    return (
      <nav className="flex absolute right-0 justify-end items-center top-0 w-full h-20">
        <div className="group inline-block relative">
          <button className="bg-transparent text-gray-700 font-semibold py-3 px-4 rounded inline-flex items-center">
            <span className="mr-2 pt-1">
              <Image
                src={flag}
                priority
                quality="100"
                width={30}
                height={22}
                alt="flag"
              />
            </span>

            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </button>
          <ul className="absolute hidden text-gray-700 pt-1 group-hover:block">
            <li className="">
              <a
                href={pathEN}
                className="rounded-t cursor-pointer bg-transparent hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
              >
                <Image
                  src={en_flag}
                  priority
                  quality="100"
                  width={30}
                  height={22}
                  alt="flag"
                />
              </a>
            </li>
            <li className="">
              <a
                href={pathFR}
                className="bg-transparent cursor-pointer hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
              >
                <Image
                  src={fr_flag}
                  priority
                  quality="100"
                  width={30}
                  height={22}
                  alt="flag"
                />
              </a>
            </li>
          </ul>
        </div>
      </nav>
    );
  }

  if (jetons < 1) {
    // RECHARGE
    return (
      <main className="w-full flex flex-col justify-center items-center text-white bg-primary h-screen">
        {LanguageBox(id, locale, fr_flag, en_flag, false)}

        <div className="flex py-12 space-y-4 max-w-xl justify-center flex-col items-center mx-8 mt-8 sm:mt-16 sm:mx-auto rounded-lg shadow-lg bg-[#191919]  ">
          <Image src={jetonsLogo} width={200} height={200} />
          <div className="text-white font-bold mx-8 py-8 px-8 text-lg max-w-sm text-center rounded-lg">
            {t("scan:noJetons")}
          </div>
          <button
            onClick={() => router.push(`${hostname}/${locale}/sign`)}
            className="w-60 py-4 flex justify-center items-center font-bold text-white border-2 border-secondary rounded-lg"
          >
            {t("scan:goHome")}
          </button>
        </div>
      </main>
    );
  } else if (activate && jetons >= 1 && relais) {
    // FOUND
    return (
      <main className="w-full flex flex-col justify-center items-center text-white bg-primary min-h-screen">
        {LanguageBox(id, locale, fr_flag, en_flag, false)}
        {step == 0 ? (
          <div className="flex items-center justify-center flex-col">
            {show ? (
              <Image src={animatedFound} width={300} height={300} />
            ) : (
              <div className="flex py-12 space-y-4 max-w-xl justify-center flex-col items-center mx-8 mt-8 sm:mt-16 sm:mx-auto rounded-lg shadow-lg bg-[#191919]  ">
                <div className="border-gray-500 border-2 space-y-4 py-12 px-4 max-w-sm mx-8 text-center rounded-lg">
                  <p>{t("scan:found:H1")}</p>
                  <p className="text-sm font-extrabold">{t("scan:found:h1")}</p>
                </div>
                <div className="text-center mx-12 mt-4 text-gray-300">
                  {t("scan:found:desc1")}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="max-w-lg py-3 px-8 mx-auto my-4 font-bold text-md border-2 border-secondary hover:border-secondaryHover rounded-lg"
                >
                  {t("scan:found:btn1")}
                </button>
              </div>
            )}
          </div>
        ) : step == 1 ? (
          <div className="flex py-4 space-y-4 max-w-xl justify-center flex-col items-center mx-8 my-20 sm:mt-16 sm:mx-auto rounded-lg shadow-lg bg-[#191919]  ">
            <div className="border-gray-500 border-2 space-y-4 py-1 px-8 max-w-sm mx-4 mt-4 text-center rounded-lg">
              <ul className="list-disc text-left space-y-2">
                <li>{t("scan:found:li1")}</li>
                <li>{t("scan:found:li2")}</li>
                <li>{t("scan:found:li3")}</li>
              </ul>
            </div>
            <div className="text-center mx-2 max-w-sm mt-4 text-gray-300">
              <div className="form-check flex mt-2 justify-left items-center">
                <input
                  className="form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                  type="radio"
                  name="flexRadioDefault"
                  id="flexRadioDefault1"
                  checked={checked}
                  onChange={() => setChecked(!checked)}
                />
                <label
                  className="form-check-label text-left  inline-block text-gray-200"
                  htmlFor="flexRadioDefault1"
                >
                  {t("scan:found:optB")}
                </label>
              </div>
              <div className="form-check flex mt-2 justify-left items-center">
                <input
                  className="form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                  type="radio"
                  name="flexRadioDefault"
                  id="flexRadioDefault2"
                  checked={!checked}
                  onChange={() => setChecked(!checked)}
                />
                <label
                  className="form-check-label text-left inline-block text-gray-200"
                  htmlFor="flexRadioDefault2"
                >
                  {t("scan:found:optA")}
                </label>
              </div>

              {checked ? (
                ""
              ) : (
                <div>
                  <div className="mt-4 max-w-xs mx-auto">
                    <label
                      htmlFor="textFullname"
                      className="block text-sm font-medium text-left text-gray-300"
                    >
                      Fullname
                    </label>
                    <div className="mt-1 ">
                      <input
                        id="textFullname"
                        name="textFullname"
                        type="text"
                        ref={fullName}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-1 max-w-xs mx-auto">
                    <label
                      htmlFor="iban"
                      className="block text-sm font-medium text-left text-gray-300"
                    >
                      IBAN
                    </label>
                    <div className="mt-1 ">
                      <input
                        id="iban"
                        name="iban"
                        type="text"
                        ref={iban}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              disabled={generating}
              onClick={handleGenerateQR}
              className="max-w-lg py-3 px-8 mx-auto my-4 font-bold text-md border-2 border-secondary hover:border-secondaryHover rounded-lg cursor-pointer"
            >
              {t("scan:found:btn2")}
            </button>
            <div className="flex justify-end">
              <ArrowCircleLeftIcon
                onClick={() => setStep(0)}
                className="text-white cursor-pointer w-6 h-6"
              />
            </div>
          </div>
        ) : step == 2 ? (
          <div className="flex py-4 space-y-4 max-w-xl justify-center flex-col items-center mx-8 my-20 sm:my-16 sm:mx-auto rounded-lg shadow-lg bg-[#191919]  ">
            <div className="w-[98%]">
              <label
                htmlFor="cp"
                className="block-inline text-sm font-medium text-gray-200"
              >
                {t("scan:found:qrZIP")}
              </label>
              <form className="mt-1 flex justify-start" onSubmit={handleLoc}>
                <input
                  className="w-32"
                  id="cp"
                  name="cp"
                  type="number"
                  ref={cp}
                  required
                />
                <button className="max-w-xl ml-2 py-2 px-4 font-bold text-md bg-emerald-500 hover:bg-emerald-600 rounded-lg">
                  <LocationMarkerIcon className="w-6 h-6 text-white inline" />
                </button>
              </form>
              {selected ? (
                <div className={"w-full h-80 mt-4 "}>
                  <Map className="w-full  h-full" center={center} zoom={13}>
                    {({ TileLayer, Marker, Popup }) => (
                      <>
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {generateMarker(Marker, Popup)}
                      </>
                    )}
                  </Map>
                </div>
              ) : (
                ""
              )}
            </div>
            {pdf ? (
              <>
                <div className="text-center max-w-xs px-4 my-4">
                  {t("scan:found:qrGenerated")}
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: selected ? "80%" : "60%",
                    clip: "rect(25px,130px,147px,9px)",
                  }}
                >
                  <Document className={""} file={`${pdf}`}>
                    <Page height={200} wrap={false} pageNumber={1} />
                  </Document>
                </div>
              </>
            ) : (
              <>
                <div className="text-center max-w-xs my-4">
                  {t("scan:found:qrGeneration")}
                </div>
                <svg
                  role="status"
                  className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-300 fill-emerald-600"
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
              </>
            )}
          </div>
        ) : (
          ""
        )}
      </main>
    );
  } else if (activate && !relais) {
    // SELECT RELAIS
    return (
      <main className="w-full flex flex-col justify-center items-center text-white bg-primary h-screen">
        {LanguageBox(id, locale, fr_flag, en_flag, true)}

        <div className="flex py-12 space-y-4 max-w-xl justify-center flex-col items-center mx-8 mt-8 sm:mt-16 sm:mx-auto rounded-lg shadow-lg bg-[#191919]  ">
          <Image src={uncomplete} width={200} height={200} />
          <div className="text-white font-bold mx-8 py-8 px-8 text-lg max-w-sm text-center rounded-lg">
            {t("scan:chooseRelais")}
          </div>
          <button
            onClick={() => router.push(`${hostname}/${locale}/sign`)}
            className="w-60 py-4 flex justify-center items-center font-bold text-white border-2 border-secondary rounded-lg"
          >
            {t("scan:goHome")}
          </button>
        </div>
      </main>
    );
  } else {
    // REGISTER
    return (
      <>
        <main
          className={`w-full pt-16 pb-4 flex flex-col justify-center items-center bg-primary min-h-screen`}
        >
          {LanguageBox(id, locale, fr_flag, en_flag, false)}
          <div className="space-y-4 pb-4">
            <Link passHref href="/">
              <div className="flex justify-center">
                <div className="cursor-pointer relative w-[58px] h-[58px] sm:w-[64px] sm:h-[64px]">
                  <Image src={icon} priority layout="fill" alt="logoReduceds" />
                </div>
              </div>
            </Link>

            <div className="">
              <div className="text-gray-300 text-center font-extrabold text-lg sm:text-xl max-w-sm">
                {t("scan:welcome")}
              </div>
              <div className="text-gray-200 text-center text-xs sm:text-base flex justify-center items-center w-full mt-1">
                {signupState ? t("scan:account") : t("scan:noAccount")}{" "}
                <span
                  className="cursor-pointer ml-1 text-gray-200 hover:text-white font-bold"
                  onClick={() => setSignupState(!signupState)}
                >
                  {signupState ? t("scan:signinBtn") : t("scan:signupBtn")}
                </span>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xs sm:max-w-lg">
            <div className="bg-white py-6 px-8 mb-8 shadow rounded-xl sm:px-10 text-gray-800">
              <form className="mb-0 space-y-3" onSubmit={onSubmit}>
                {signupState ? (
                  <>
                    <div>
                      <label
                        htmlFor="textFirstname"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("scan:field:firstname")}
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
                        {t("scan:field:lastname")}
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
                    {t("scan:field:email")}
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
                    {t("scan:field:password")}
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
                        {t("scan:field:repeatPassword")}
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
                        <span> {t("scan:agree")} </span>
                        <a
                          href={`${hostname}/${locale}/terms`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {t("scan:terms")}
                        </a>
                        <span> {t("scan:and")} </span>
                        <a
                          href={`${hostname}/${locale}/privacy`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {t("scan:privacy")}
                        </a>
                      </label>
                    </div>

                    <div className="flex justify-center w-full">
                      <button
                        disabled={formLoading}
                        className="w-full py-4 font-md text-white text-md bg-gray-700 hover:bg-gray-800 rounded-lg"
                      >
                        {t("scan:signupButtonTxt")}
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
                        {t("scan:forgotPassword")}
                      </div>
                      <Modal showModal={showModal} setShowModal={setShowModal}>
                        <div className="flex justify-start px-10 py-24 items-center leading-3 flex-col text-primary">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="text-lg sm:text-lg md:text-xl font-extrabold text-gray-800 text-center">
                              {t("scan:forgot:heading")}
                            </div>
                            <div className="text-xs sm:text-md text-gray-700 max-w-sm text-center leading-4">
                              {t("scan:forgot:desc")}
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
                              {t("scan:forgot:rstButtonText")}
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
                        {t("scan:signinButtonTxt")}
                      </button>
                    </div>

                    <div className="w-full text-center border-b-[1px] border-gray-400 leading-[5px]">
                      <span className="bg-white py-1 px-1">{t("scan:or")}</span>
                    </div>

                    <div className="flex flex-col">
                      <SignInGoogleButton
                        id={id}
                        hostname={hostname}
                        locale={locale}
                      />

                      <SignInFacebookButton
                        id={id}
                        hostname={hostname}
                        locale={locale}
                      />
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </main>
      </>
    );
  }
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
    const response = await fetch(`/api/user/settings/addInfo`, {
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
      throw new Error(t("scan:errorSignGoogle"));
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
      await handleRegister(id, userCredential.user.email);
      router.push(`${hostname}/${locale}/scan/select/${id}`);
    } catch (err) {
      return toast.error(t("scan:errorSignGoogle"));
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
      <span className="ml-2">{t("scan:signInWithGoogle")}</span>
    </button>
  );
}

// Sign in with Facebook button
function SignInFacebookButton() {
  const { t } = useTranslation();
  const router = useRouter();

  async function manageFacebookUserData(userCredential) {
    let lastName =
      userCredential.user.displayName.split(" ").length == 1
        ? ""
        : userCredential.user.displayName.split(" ")[1];

    const response = await fetch(`/api/user/settings/addInfo`, {
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
      throw new Error(t("scan:errorSignFb"));
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
      await handleRegister(id, userCredential.user.email);
      router.push(`${hostname}/${locale}/scan/select/${id}`);
    } catch (err) {
      return toast.error(t("scan:errorSignFb"));
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
      <span className="ml-2">{t("scan:signInWithFacebook")}</span>
    </button>
  );
}
