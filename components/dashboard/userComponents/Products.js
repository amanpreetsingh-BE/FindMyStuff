import { useRouter } from "next/router";
/* Hero icons */
import { LocationMarkerIcon } from "@heroicons/react/outline";
import { ArrowCircleLeftIcon } from "@heroicons/react/outline";
import { CashIcon } from "@heroicons/react/outline";

/* fetch and paymentflow */
import axios from "axios";
import getStripe from "@lib/stripe";

export default function Products({
  useState,
  locale,
  Modal,
  t,
  hostname,
  toast,
  Image,
  email,
  userProductsJSON,
  useRef,
}) {
  /* Used to push to dashboard */
  const router = useRouter();
  const qty = useRef(1);
  const [showModal, setShowModal] = useState(false);
  const [modalID, setModalID] = useState("");
  const [modalRelaisCP, setModalRelaisCP] = useState("");
  const [modalRelaisStreet, setModalRelaisStreet] = useState("");
  const [modalRelaisPhoto, setModalRelaisPhoto] = useState("");
  const [modalJetons, setModalJetons] = useState("");
  const [modalRelaisHeading, setModalRelaisHeading] = useState("");
  const [rd, setRd] = useState(false);
  const [rj, setRj] = useState(false);

  const couponsClass =
    "grid place-items-center gap-8 grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto px-12 py-16";
  const emptyCouponsClass =
    "flex justify-center items-center max-w-7xl mx-auto px-8 py-16";

  function openModal() {
    setShowModal((prev) => !prev);
  }

  const renderProducts = (products) => {
    const cards = [];

    function openStockModal(
      id,
      relaisHeading,
      relaisCP,
      relaisStreet,
      relaisPhoto,
      jetons
    ) {
      setModalID(id);
      setModalRelaisHeading(relaisHeading);
      setModalRelaisCP(relaisCP);
      setModalRelaisStreet(relaisStreet);
      setModalRelaisPhoto(relaisPhoto);
      setModalJetons(jetons);
      if (!relaisHeading && !relaisCP && !relaisStreet && !relaisPhoto) {
        router.push(`${hostname}/scan/select/${id}`);
      } else {
        openModal();
      }
    }

    products.forEach((product) => {
      const id = product.id;
      const jetons = product.data.jetons;
      const relaisHeading =
        product.data.relais == null ? null : product.data.relais.heading;
      const relaisCP =
        product.data.relais == null ? null : product.data.relais.code;
      const relaisStreet =
        product.data.relais == null ? null : product.data.relais.street;
      const relaisPhoto =
        product.data.relais == null ? null : product.data.relais.urlPhoto;
      cards.push(
        <div
          key={id}
          onClick={() =>
            openStockModal(
              id,
              relaisHeading,
              relaisCP,
              relaisStreet,
              relaisPhoto,
              jetons
            )
          }
          className="flex flex-col justify-center items-center w-52 h-52 sm:w-72 sm:h-72 rounded-lg bg-[#191919] shadow-sm shadow-secondary border-secondary border-2 hover:shadow-lg cursor-pointer"
        >
          <div className="text-lg font-bold ">{id}</div>
          {jetons >= 1 ? (
            <div className=" font-bold text-sm">
              {t("dashboard:user:prodPage:delivery")} {jetons}
            </div>
          ) : (
            <div className=" text-red-400 font-bold text-sm">
              {t("dashboard:user:prodPage:delivery")} {jetons}
            </div>
          )}
        </div>
      );
    });
    return cards;
  };

  function renderDelivery() {
    return (
      <>
        <div className="mt-4 border-2 rounded-lg px-4 pt-4 mx-4 ">
          <div className="flex justify-center items-center space-x-6 sm:space-x-8 lg:space-x-10">
            <div className="">
              <h1 className="text-xl font-mono">{modalRelaisHeading}</h1>
              <p className="text-sm">
                {modalRelaisStreet + ", " + modalRelaisCP}
              </p>
            </div>
            <div className="">
              <Image src={modalRelaisPhoto} width={140} height={140} />
            </div>
          </div>
          <button
            onClick={handleChangeRelais}
            className="max-w-lg py-3 px-6 mx-auto my-4 font-bold text-md bg-secondary hover:bg-secondaryHover rounded-lg flex"
          >
            <LocationMarkerIcon className="w-6 h-6 text-white" />{" "}
            <span className="text-white ml-2">
              {t("dashboard:user:prodPage:changeDelivery")}
            </span>
          </button>
        </div>

        <div
          className="flex justify-center my-auto items-center cursor-pointer"
          onClick={() => setRd(false)}
        >
          <ArrowCircleLeftIcon className="text-gray-800 w-6 h-6" />{" "}
          <span>{t("dashboard:user:prodPage:back")}</span>
        </div>
      </>
    );
  }

  function renderJetons() {
    return (
      <div className="px-6">
        <div className="text-xs pt-2 text-center ">
          {t("dashboard:user:prodPage:tokenDesc")}
        </div>
        <div className="mt-4 border-2 rounded-lg px-2 mx-4">
          <div className="flex justify-center items-center space-x-8">
            <h1 className="text-sm py-2 text-center font-mono">
              {t("dashboard:user:prodPage:tokenState")} {modalJetons}{" "}
            </h1>
          </div>
          <div className="flex px-4 flex-col justify-center items-center">
            <input
              className="text-center w-52 h-8"
              id="qty"
              name="qty"
              type="number"
              placeholder={t("dashboard:user:prodPage:qty")}
              ref={qty}
              min="1"
              max="100"
            />
            <button
              onClick={handleReload}
              className="max-w-xl py-3 px-2 mx-auto my-2 font-bold text-md bg-secondary hover:bg-secondaryHover rounded-lg flex"
            >
              <CashIcon className="w-6 h-6 text-white" />{" "}
              <span className="text-white ml-2">
                {t("dashboard:user:prodPage:reloadBtn")}
              </span>
            </button>
          </div>
        </div>
        <div
          className="flex justify-center mt-4 items-center cursor-pointer"
          onClick={() => setRj(false)}
        >
          <ArrowCircleLeftIcon className="text-gray-800 w-6 h-6" />{" "}
          <span>{t("dashboard:user:prodPage:back")}</span>
        </div>
      </div>
    );
  }

  const handleChangeRelais = async (e) => {
    router.push(`/scan/select/${modalID}`);
  };

  const handleReload = async (e) => {
    e.preventDefault();
    if (qty.current.value === "") {
      return toast.error(t("dashboard:user:prodPage:specifyQty"));
    } else if (qty.current.value <= 0) {
      return toast.error(t("dashboard:user:prodPage:specifyQtyPos"));
    } else {
      try {
        const {
          data: { id },
        } = await axios.post(`/api/checkout`, {
          cat: "reload",
          model: "reload", // to be changed in V2 to selectedModel[0].model
          color: "reload",
          priceID: "price_1Kiy4CK5KPA8d9OvQzVaAiQD",
          qrID: modalID,
          locale: locale,
          quantity: qty.current.value,
        });
        const stripe = await getStripe();

        await stripe.redirectToCheckout({ sessionId: id });
      } catch (err) {
        toast.error(t("dashboard:user:prodPage:stripeError"));
      }
    }
  };

  return (
    <>
      <div className="my-20 mx-12 lg:mx-auto px-12 py-12 bg-[#191919] max-w-4xl rounded-lg shadow-lg p-6">
        <div className="flex font-mono justify-center text-center items-center font-bold text-2xl lg:text-3xl mb-8">
          {t("dashboard:user:prodPage:heading")}
        </div>

        <div
          className={
            userProductsJSON.length > 0 ? couponsClass : emptyCouponsClass
          }
        >
          {userProductsJSON.length > 0 ? (
            renderProducts(userProductsJSON)
          ) : (
            <div className="text-center">
              {t("dashboard:user:prodPage:empty")}
            </div>
          )}
          <div className="absolute">
            <Modal showModal={showModal} setShowModal={setShowModal}>
              <div className="w-full h-full flex flex-col justify-start items-center">
                <h1
                  className={`text-2xl font-mono ${
                    rd || rj ? "pt-12" : "pt-24"
                  }`}
                >
                  {t("dashboard:user:prodPage:h1")}
                </h1>
                {rd ? (
                  renderDelivery()
                ) : rj ? (
                  renderJetons()
                ) : (
                  <div className="mt-12 grid place-items-center gap-4 grid-cols-2">
                    <div
                      onClick={() => setRd(true)}
                      className="bg-secondaryHover cursor-pointer w-28 h-28 px-4 py-4 sm:w-40 sm:h-40 sm:px-12 sm:py-12 rounded-lg text-center flex justify-center items-center text-white font-bold"
                    >
                      {t("dashboard:user:prodPage:l1")}
                    </div>
                    <div
                      onClick={() => setRj(true)}
                      className="bg-secondaryHover cursor-pointer w-28 h-28 px-4 py-4 sm:w-40 sm:h-40 sm:px-12 sm:py-12 rounded-lg text-center flex justify-center items-center text-white font-bold"
                    >
                      {t("dashboard:user:prodPage:l2")}
                    </div>
                  </div>
                )}
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
}
