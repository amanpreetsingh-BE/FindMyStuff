/* Icons */
import { CheckCircleIcon, TruckIcon } from "@heroicons/react/solid";

/* fetch and paymentflow */
import axios from "axios";
import getStripe from "@lib/stripe";

function ProductsSection({
  motion,
  useState,
  toast,
  Image,
  t,
  productsJSON,
  locale,
}) {
  /* Temp code */
  const K1 = productsJSON[0][0].colors[0]; // K1
  const K2 = productsJSON[0][0].colors[1]; // K2
  const [selectedColor, setSelectedColor] = useState(K1);
  const [loading, setLoading] = useState(false);
  /* Handle products */
  const redirectToCheckout = async (e, cat, product) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data: { id },
      } = await axios.post(`/api/checkout`, {
        cat: cat,
        priceID: cat == "Keychain" ? product.priceID : product.data.priceID, // ambiguous, need to update in V2
        model: cat == "Keychain" ? "Square keychain" : product.id, // to be changed in V2 to selectedModel[0].model
        color: cat == "Keychain" ? product.color : product.data.color, // ambiguous, need to update in V2
        imgURL: cat == "Keychain" ? product.imageURL : product.data.imageURL, // ambiguous, need to update in V2
        locale: locale,
      });
      const stripe = await getStripe();
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (err) {
      toast.error(t("home:stripe:error"));
      setLoading(false);
    }
  };

  const renderKeychains = () => {
    let sw = [];
    const keychains = productsJSON[0][0].colors; // if multiple keychains -> productsJSON[0]
    keychains.forEach((keychain) => {
      sw.push(
        <div
          key={keychain.priceID}
          className="flex items-center justify-center w-96 "
        >
          <motion.div whileHover={{ scale: 1.1 }}>
            <div className="bg-[#1B212E] relative px-6 py-8 rounded-lg flex flex-col ">
              <div className="flex flex-col justify-center items-center w-full pb-12">
                <div className="text-xl text-gray-300 font-semibold ">
                  {t("home:prod:configurator:price")} {keychain.price}
                </div>
                <div className="text-xs text-gray-300 flex items-center justify-start font-semibold">
                  <TruckIcon className="w-4 h-4 mr-1" />{" "}
                  {t("home:prod:configurator:shipping")}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Image
                  priority={true}
                  src={keychain.imageURL}
                  width={200}
                  height={200}
                  alt=""
                />
                <div className="my-4 text-gray-300 space-y-1">
                  <div className="text-xs w-full flex items-center justify-start font-semibold px-12">
                    <CheckCircleIcon className="w-4 h-4 mr-1 text-secondaryHover" />{" "}
                    {t("home:prod:configurator:packaging")}
                  </div>
                  <div className="text-xs w-full flex items-center justify-start font-semibold px-12">
                    <CheckCircleIcon className="w-4 h-4 mr-1 text-secondaryHover" />{" "}
                    {t("home:prod:configurator:material")}
                  </div>
                  <div className="text-xs w-full flex items-center justify-start font-semibold px-12">
                    <CheckCircleIcon className="w-4 h-4 mr-1 text-secondaryHover" />{" "}
                    {t("home:prod:configurator:holder")}
                  </div>
                  <div className="text-xs w-full flex items-center justify-start font-semibold px-12">
                    <CheckCircleIcon className="w-4 h-4 mr-1 text-secondaryHover" />{" "}
                    {t("home:prod:configurator:activate")}
                  </div>
                </div>
              </div>

              <div className="pt-2 w-full flex flex-col justify-center items-center">
                <button
                  onClick={(e) =>
                    redirectToCheckout(e, "Keychain", selectedColor)
                  }
                  disabled={
                    selectedColor.quantity > 0 && !loading ? false : true
                  }
                  className="bg-secondary cursor-pointer hover:bg-secondaryHover text-white font-bold rounded-lg px-12 py-4"
                >
                  {t("home:prod:configurator:checkout")}
                </button>
                {selectedColor.quantity > 0 ? (
                  <div className="text-green-500 text-xs italic mt-1">
                    {t("home:prod:configurator:stock")}
                  </div>
                ) : (
                  <div className="text-red-500 text-xs italic mt-1">
                    {t("home:prod:configurator:outStock")}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      );
    });
    return sw;
  };

  const renderProducts = (products) => {
    const cards = [];

    products.forEach((product) => {
      const name = product.id;
      if (product.colors) {
        const colors = product.colors;
        colors.forEach((color) => {
          cards.push(
            <motion.div
              key={color.priceID}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="flex flex-col text-white cursor-pointer bg-[#1B212E] justify-center items-center w-[350px] h-[350px] px-4 py-4 mt-12  rounded-lg shadow-lg hover:shadow-xl ">
                <div className="text-lg font-bold ">
                  {name} {} {color.color}
                </div>
                <div className="text-sm font-bold mb-8">{color.price}</div>
                <Image
                  priority={true}
                  src={color.imageURL}
                  width={144}
                  height={144}
                  alt=""
                />
                <button
                  onClick={(e) => redirectToCheckout(e, "Sticker", product)}
                  disabled={color.quantity > 0 && !loading ? false : true}
                  className="bg-secondary text-sm mt-4 hover:bg-secondaryHover text-white font-bold rounded-lg px-8 py-4"
                >
                  {t("home:prod:configurator:checkout")}
                </button>
                {color.quantity > 0 ? (
                  <div className="text-sm text-emerald-500 mt-1 font-bold">
                    {color.status}
                  </div>
                ) : (
                  <div className="text-sm text-red-500 mt-1 font-bold">
                    {color.status}
                  </div>
                )}
              </div>
            </motion.div>
          );
        });
      } else {
        cards.push(
          <motion.div
            key={product.data.priceID}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="flex flex-col text-white cursor-pointer bg-[#1B212E] justify-center items-center w-[350px] h-[350px] px-4 py-4 mt-12 rounded-lg shadow-lg hover:shadow-xl ">
              <div className="text-lg font-bold  ">{name}</div>
              <div className="text-sm font-bold mb-8">
                {product.data.price} €
              </div>
              <Image
                priority={true}
                src={product.data.imageURL}
                width={144}
                height={144}
                alt=""
              />
              <button
                onClick={(e) => redirectToCheckout(e, "Sticker", product)}
                disabled={product.data.quantity > 0 && !loading ? false : true}
                className="bg-secondary text-sm mt-4 hover:bg-secondaryHover text-white font-bold rounded-lg px-8 py-4"
              >
                {t("home:prod:configurator:checkout")}
              </button>
              {product.data.quantity > 0 ? (
                <div className="text-sm text-emerald-500 mt-1 font-bold">
                  {product.data.status}
                </div>
              ) : (
                <div className="text-sm text-red-500 mt-1 font-bold">
                  {product.data.status}
                </div>
              )}
            </div>
          </motion.div>
        );
      }
    });
    return cards;
  };
  function renderKeychainCat() {
    return (
      <section id="products" className="bg-[#171717]">
        <div className="text-white text-center pt-8 mb-16 font-bold text-2xl sm:text-3xl md:text-4xl">
          {t("home:prod:configurator:h1")}
        </div>
        <div className="text-gray-200 text-center mb-4 font-bold text-xl sm:text-xl md:text-2xl">
          {t("home:prod:configurator:h2")}
        </div>
        <div className="space-y-5 text-center flex justify-center items-center flex-col mb-12 xl:mb-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[#292929] font-bold rounded-lg px-12 py-4 cursor-pointer"
            onClick={() => setSelectedColor(K1)}
          >
            Dark gray
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[#1E2655] ont-bold rounded-lg px-12 py-4 cursor-pointer"
            onClick={() => setSelectedColor(K2)}
          >
            Royal blue
          </motion.div>
        </div>
        <div className="w-full sm:pt-20 pb-60">
          {productsJSON ? (
            <div
              key={selectedColor.priceID}
              className="flex items-center justify-center w-3/4 mx-auto "
            >
              <div className="relative px-6 xl:px-20 py-8 bg-[#191919] rounded-lg flex flex-col">
                <div className="flex flex-col xl:flex-row items-center">
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <Image
                      priority={true}
                      src={selectedColor.imageURL}
                      width={400}
                      height={400}
                      alt=""
                    />
                  </motion.div>
                  <div className="space-y-5">
                    <div className="pl-0 xl:pl-6">
                      <div className="text-xl text-white font-semibold">
                        {t("home:prod:configurator:price")}{" "}
                        {selectedColor.price}
                      </div>
                      <div className="text-xs text-white flex ">
                        <TruckIcon className="w-4 h-4 mr-1" />{" "}
                        {t("home:prod:configurator:shipping")}
                      </div>
                    </div>
                    <div className="text-white space-y-3 pb-4 xl:pb-0">
                      <div className="text-sm w-full flex items-center justify-start font-semibold xl:pl-6">
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-secondaryHover" />{" "}
                        {t("home:prod:configurator:A1")}
                      </div>
                      <div className="text-sm w-full flex items-center justify-start font-semibold xl:pl-6">
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-secondaryHover" />{" "}
                        {t("home:prod:configurator:A2")}
                      </div>
                      <div className="text-sm w-full flex items-center justify-start font-semibold xl:pl-6">
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-secondaryHover" />{" "}
                        {t("home:prod:configurator:A3")}
                      </div>
                      <div className="text-sm w-full flex items-center justify-start font-semibold xl:pl-6">
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-secondaryHover" />{" "}
                        {t("home:prod:configurator:A4")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 w-full flex flex-col justify-center items-center">
                  <button
                    onClick={(e) =>
                      redirectToCheckout(e, "Keychain", selectedColor)
                    }
                    disabled={
                      selectedColor.quantity > 0 && !loading ? false : true
                    }
                    className="bg-secondary cursor-pointer hover:bg-secondaryHover text-white font-bold rounded-lg px-12 py-4"
                  >
                    {t("home:prod:configurator:checkout")}
                  </button>
                  {selectedColor.quantity > 0 ? (
                    <div className="text-green-500 text-xs italic mt-1">
                      {t("home:prod:configurator:stock")}
                    </div>
                  ) : (
                    <div className="text-red-500 text-xs italic mt-1">
                      {t("home:prod:configurator:outStock")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-300 text-sm">
              Oops something is wrong .. Please try again by refreshing !
            </div>
          )}
        </div>
      </section>
    );
  }
  function renderStickerCat() {
    if (productsJSON && productsJSON[1].length > 0) {
      return (
        <section id="" className="bg-[#171C26]">
          <div className="text-gray-300 text-center mb-16 font-bold text-2xl sm:text-3xl md:text-4xl">
            {" "}
            {t("home:prod:stickersCat:h1")}
          </div>
          <div className="w-full sm:pt-20 pb-60">
            {productsJSON[1] ? (
              <div className="grid place-items-center grid-cols-1 lg:grid-cols-2">
                {renderProducts(productsJSON[1])}
              </div>
            ) : (
              <div className="text-center text-gray-300 text-sm">
                Oops something is wrong .. Please try again by refreshing !
              </div>
            )}
          </div>
        </section>
      );
    } else {
      return "";
    }
  }

  function renderTrackerCat() {
    if (productsJSON && productsJSON[2].length > 0) {
      return (
        <section id="" className="bg-[#171C26]">
          <div className="text-gray-300 text-center mb-16 font-bold text-2xl sm:text-3xl md:text-4xl">
            {" "}
            {t("home:prod:trackerCat:h1")}
          </div>
          <div className="w-full sm:pt-20 pb-60">
            {productsJSON[2] ? (
              <div className="grid place-items-center grid-cols-1 lg:grid-cols-2">
                {renderProducts(productsJSON[2])}
              </div>
            ) : (
              <div className="text-center text-gray-300 text-sm">
                Oops something is wrong .. Please try again by refreshing !
              </div>
            )}
          </div>
        </section>
      );
    } else {
      return "";
    }
  }

  function renderOtherCat() {
    if (productsJSON && productsJSON[3].length > 0) {
      return (
        <section id="" className="bg-[#171C26]">
          <div className="text-gray-300 text-center mb-16 font-bold text-2xl sm:text-3xl md:text-4xl">
            {" "}
            {t("home:prod:otherCat:h1")}
          </div>
          <div className="w-full sm:pt-20 pb-60">
            {productsJSON[3] ? (
              <div className="grid place-items-center grid-cols-1 lg:grid-cols-2">
                {renderProducts(productsJSON[3])}
              </div>
            ) : (
              <div className="text-center text-gray-300 text-sm">
                Oops something is wrong .. Please try again by refreshing !
              </div>
            )}
          </div>
        </section>
      );
    } else {
      return "";
    }
  }

  return (
    <div>
      {renderKeychainCat()}
      {renderStickerCat()}
      {renderTrackerCat()}
      {renderOtherCat()}
    </div>
  );
}

export default ProductsSection;
