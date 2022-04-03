/* Firebase components imports */
import { auth } from "@lib/firebase";
import { XIcon, MailIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";

export default function Parameters({
  useState,
  useRef,
  Modal,
  t,
  signMethod,
  userLocale,
  toast,
  email,
  firstName,
  lastName,
  uid,
  oob,
}) {
  const formFirstname = useRef();
  const formLastname = useRef();
  const type = useRef();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function openModal() {
    setShowModal((prev) => !prev);
  }

  const resetPassword = async (e) => {
    e.preventDefault();
    router.push(`/${userLocale}/resetPwd?oob=${oob}&uid=${uid}`);
  };

  const deleteAcc = async (e) => {
    e.preventDefault();
    setDeleting(true);
    try {
      const data = {
        uid: uid,
        oob: oob,
        email: email,
      };
      const response = await fetch(`/api/user/delete`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseJSON = await response.json();
      if (responseJSON.success) {
        toast.success(t("dashboard:user:paramPage:delSuccess"));
        auth.updateCurrentUser(null).then(() => {
          router.push("/");
        });
      }
    } catch (err) {
      setDeleting(false);
      return toast.error(err.message);
    }
  };

  const updateAcc = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const re = /^[a-zA-Z]*$/;
    if (
      !re.test(formFirstname.current.value) ||
      !re.test(formLastname.current.value)
    ) {
      setUpdating(false);
      // number and special characters test
      return toast.error(t("dashboard:user:paramPage:updateSpecialC"));
    } else if (
      formFirstname.current.value.length > 26 ||
      formLastname.current.value.length > 26
    ) {
      setUpdating(false);
      return toast.error(t("dashboard:user:paramPage:tooMuch"));
    } else if (
      (!(formFirstname.current.value == "") &&
        formFirstname.current.value.length < 3) ||
      (!(formLastname.current.value == "") &&
        formLastname.current.value.length < 3)
    ) {
      setUpdating(false);
      return toast.error(t("dashboard:user:paramPage:tooSmall"));
    } else {
      try {
        const data = {
          uid: uid,
          oob: oob,
          locale: type.current.value == "Français" ? "fr" : "en",
          firstName:
            formFirstname.current.value == ""
              ? firstName
              : formFirstname.current.value,
          lastName:
            formLastname.current.value == ""
              ? lastName
              : formLastname.current.value,
        };
        const response = await fetch(`/api/user/updateInfo`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const responseJSON = await response.json();
        if (responseJSON.success) {
          toast.success(t("dashboard:user:paramPage:pupdate"));
          return router.reload();
        }
      } catch (err) {
        setUpdating(false);
        return toast.error(err.message);
      }
    }
  };
  return (
    <div className="mt-24 mb-8 mx-8 sm:mx-12 lg:mx-auto px-8 py-8 sm:px-12 sm:py-12 bg-[#191919] max-w-4xl rounded-lg shadow-lg">
      <div className="flex text-center font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
        {t("dashboard:user:paramPage:heading")}
      </div>

      <div className="">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-200"
        >
          {t("dashboard:user:paramPage:email")}
        </label>
        <div className="mt-1 max-w-xs">
          <input
            id="email"
            name="email"
            type="email"
            placeholder={email}
            readOnly
            required
          />
        </div>
        <label
          htmlFor="textFirstname"
          className="block text-sm font-medium text-gray-200 mt-6"
        >
          {t("dashboard:user:paramPage:firstname")}
        </label>
        <div className="mt-1 max-w-xs">
          <input
            id="textFirstname"
            name="textFirstname"
            type="text"
            ref={formFirstname}
            placeholder={firstName}
            required
          />
        </div>
        <label
          htmlFor="textLastname"
          className="block text-sm font-medium text-gray-200 mt-6"
        >
          {t("dashboard:user:paramPage:lastname")}
        </label>
        <div className="mt-1 max-w-xs">
          <input
            id="textLastname"
            name="textLastname"
            type="text"
            ref={formLastname}
            placeholder={lastName}
            required
          />
        </div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-200 mt-6"
        >
          {t("dashboard:user:paramPage:language")}
        </label>
        <div className="mt-1 max-w-xs">
          <select ref={type} name="type" id="type">
            <option>
              {" "}
              {userLocale ===
              ("fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr")
                ? "Français"
                : "English"}
            </option>
            <option>
              {userLocale ===
              ("fr" || "FR" || "fr-BE" || "fr-be" || "fr-FR" || "fr-fr")
                ? "English"
                : "Français"}
            </option>
          </select>
        </div>

        <div className="flex justify-center items-center">
          <button
            disabled={updating}
            onClick={updateAcc}
            className="max-w-lg py-3 px-4 mx-auto my-4 font-bold text-md border-2 border-secondary hover:border-secondaryHover rounded-lg"
          >
            {t("dashboard:user:paramPage:update")}
          </button>
        </div>
      </div>

      <div className="flex mt-4 text-sm font-bold">
        <ul className="space-y-4">
          {signMethod != "email" ? (
            ""
          ) : (
            <li
              onClick={resetPassword}
              className="cursor-pointer flex justify-start items-center"
            >
              {" "}
              <MailIcon className="w-6 h-6 mr-2" />
              {t("dashboard:user:paramPage:reset")}
            </li>
          )}
          <li
            onClick={openModal}
            className="cursor-pointer text-red-400 flex justify-start items-center"
          >
            {" "}
            <XIcon className="w-6 h-6 mr-2" />
            {t("dashboard:user:paramPage:delete")}
          </li>
          <div className="absolute">
            <Modal showModal={showModal} setShowModal={setShowModal}>
              <div className="w-full h-full flex flex-col justify-start items-center">
                <h1 className="text-xl font-mono pt-16">
                  {t("dashboard:user:paramPage:h2")}
                </h1>
              </div>
              <ul className="list-disc space-y-3 font-normal px-12">
                <li>{t("dashboard:user:paramPage:del1")}</li>
                <li>{t("dashboard:user:paramPage:del2")}</li>
                <li>{t("dashboard:user:paramPage:del3")}</li>
              </ul>
              <button
                disabled={deleting}
                onClick={deleteAcc}
                className="px-8 h-12 text-white mx-auto font-bold text-md bg-red-500 hover:bg-red-600 rounded-lg"
              >
                {t("dashboard:user:paramPage:delBtn")}
              </button>
            </Modal>
          </div>
        </ul>
      </div>
    </div>
  );
}
