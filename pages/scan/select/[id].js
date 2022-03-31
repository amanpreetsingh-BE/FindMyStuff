/* React imports */
import { useState, useRef } from "react";
/* Built-in Next.js imports */
import Image from "next/image";
import { useRouter } from "next/router";
/* Hero icons */
import { LocationMarkerIcon } from "@heroicons/react/outline";

/* Translate imports */
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import toast from "react-hot-toast";

import Map from "@components/Map";

import zipJSON from "@root/public/misc/zipcode-belgium.json";

/* Handle language */
export async function getServerSideProps({ params, req, res, locale }) {
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
  const firebaseToken = req.cookies.firebaseToken;
  if (firebaseToken) {
    let decodedToken = null;
    let user = null;
    let userEmail = null;
    let firstName = null;
    let lastName = null;
    let uid = null;
    let emailVerified = null;
    let qrEmail = null;
    let activate = null;
    let relais = null;
    let verifySent = null;
    let signMethod = null;
    try {
      decodedToken = await app.auth().verifyIdToken(firebaseToken, true);
      user = await app.auth().getUser(decodedToken.uid);
      uid = user.uid;
      userEmail = user.email;
      emailVerified = user.emailVerified;
      const query = app
        .firestore()
        .collection("users")
        .where("email", "==", userEmail);
      const querySnapshot = await query.get();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        firstName = data.firstName;
        lastName = data.lastName;
        verifySent = data.verifySent;
        signMethod = data.signMethod;
      });
      const docSnapshot = await app.firestore().collection("QR").doc(id).get();
      // check if is the owner of the QR making the request and is connected
      if (docSnapshot.exists) {
        qrEmail = docSnapshot.data().email;
        activate = docSnapshot.data().activate;
        relais = docSnapshot.data().relais;
        /* QR not activated and no relais saved -> go to QR registration again*/
        if (!activate) {
          res.setHeader(
            "location",
            `${process.env.HOSTNAME}/${locale}/scan/${id}`
          );
          res.statusCode = 302;
          res.end();
          return { props: {} };
        } else if (activate && userEmail !== qrEmail) {
          // connected, activated but not the owner ..
          return {
            notFound: true, // not a valid QR
          };
        } else if (activate && userEmail === qrEmail) {
          // valid user and owner, want to change or add new relais

          if (signMethod != "email" && !emailVerified) {
            await app.auth().updateUser(uid, { emailVerified: true });
            var docRef = app.firestore().collection("users").doc(`${uid}`);

            await docRef.update({
              verifySent: true,
            });
          }

          if (!emailVerified && !verifySent) {
            // send verification email, if not sent for the next step
            let oob = md5(`${uid}${process.env.SS_API_KEY}`);
            const template =
              locale ===
              ("fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr")
                ? "d-0aaff71cc7cb4fd597128d669dfe3fd3"
                : "d-6f085881bbd9471d8c5b83e285e798d6";

            const context = {
              url: `${hostname}/verified?oob=${oob}&uid=${uid}`,
              firstName: firstName,
              lastName: lastName,
            };
            const msg = {
              from: {
                email: process.env.MAIL,
                name: "FindMyStuff",
              },
              template_id: template,
              personalizations: [
                {
                  to: [
                    {
                      email: userEmail,
                    },
                  ],
                  dynamic_template_data: context,
                },
              ],
            };
            const axios = require("axios");

            try {
              axios({
                method: "post",
                url: "https://api.sendgrid.com/v3/mail/send",
                headers: {
                  Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
                },
                data: msg,
              });
              /* update verify sent, so next refresh it does not send again the verification email */
              var docRef = app.firestore().collection("users").doc(`${uid}`);

              await docRef.update({
                verifySent: true,
              });
            } catch (err) {
              console.log(err.message);
            }
          }

          let oob = md5(`${id}${process.env.SS_API_KEY}`);
          return {
            props: {
              ...(await serverSideTranslations(locale, ["scan"])),
              locale,
              id,
              hostname,
              oob,
            },
          };
        } else {
          return {
            notFound: true, // not a valid request
          };
        }
      } else {
        return {
          notFound: true, // not a valid QR
        };
      }
    } catch (err) {
      console.log(err.message); // debug purpose
      // Corrupted token, try to login again to erase corrupt one
      res.setHeader("location", `${process.env.HOSTNAME}/${locale}/sign`); // connected
      res.statusCode = 302;
      res.end();
      return { props: {} };
    }
  } else {
    // not connected, send to login
    res.setHeader("location", `${process.env.HOSTNAME}/${locale}/sign`);
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }
}

export default function SelectPage({ id, hostname, locale, oob }) {
  /* Handle language */
  const { t } = useTranslation();
  const en_flag = require("@images/icons/gb.svg");
  const fr_flag = require("@images/icons/fr.svg");
  /* Used to push to dashboard */
  const router = useRouter();

  const cp = useRef();
  const [center, setCenter] = useState([50.85034, 4.35171]);
  const [listPt, setListPt] = useState(null);
  const [selected, setSelected] = useState(false);
  const [selection, setSelection] = useState("");
  const [loading, setLoading] = useState(false);

  function LanguageBox(locale, fr_flag, en_flag) {
    const flag = locale === "en" ? en_flag : fr_flag;
    return (
      <nav className="flex -mt-12 justify-end items-center top-0 w-full h-20">
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
                href={`${hostname}/en/scan/select/${id}`}
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
                href={`${hostname}/fr/scan/select/${id}`}
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
    setLoading(true);
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
      setLoading(false);
    } catch (err) {
      setLoading(false);
      return toast.error(t("scan:select:errLoc"));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (selection == "") {
      setLoading(false);
      return toast.error(t("scan:select:noSelect"));
    } else {
      try {
        const data = {
          id: id,
          oob: oob,
          selection: selection,
        };
        const response = await fetch(`/api/qr/registerRelais`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const responseJSON = await response.json();
        if (responseJSON.success) {
          toast.success(t("scan:select:success"));
          router.push(`${hostname}/${locale}/dashboard`);
        } else {
          setLoading(false);
          toast.error(t("scan:select:err"));
        }
      } catch (err) {
        setLoading(false);
        return toast.error(t("scan:select:err"));
      }
    }
  };

  return (
    <main className="bg-primary text-white min-h-screen px-8 py-12">
      <div className="mb-12">{LanguageBox(locale, fr_flag, en_flag)}</div>
      <div className="flex py-12 max-w-3xl justify-center flex-col items-center  sm:mt-4 sm:mx-auto rounded-lg shadow-lg bg-[#191919]  ">
        <div className="font-bold text-xl sm:text-2xl ">
          {t("scan:select:heading")}
        </div>
        <div className="max-w-sm px-4 text-center">{t("scan:select:desc")}</div>
        <div className="mt-8 w-full px-4 text-center flex flex-col justify-center items-center">
          <label
            htmlFor="cp"
            className="block-inline text-sm font-medium text-gray-200 text-left"
          >
            {t("scan:select:code")}
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
            <button
              disabled={loading}
              className="max-w-xl ml-2 py-2 px-4 font-bold text-md bg-secondary hover:bg-secondaryHover rounded-lg"
            >
              <LocationMarkerIcon className="w-6 h-6 text-white" />
            </button>
          </form>
          {selected ? (
            <div className="w-full">
              <div className={"w-full h-96 py-4"}>
                <Map className="w-full h-full" center={center} zoom={13}>
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
              <div className="flex justify-center items-center">
                <button
                  className="max-w-xl py-4  px-4 font-bold text-md border-2 border-secondary rounded-lg"
                  onClick={handleRegister}
                  disabled={loading}
                >
                  {t("scan:select:saveBtn")}
                </button>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </main>
  );
}
