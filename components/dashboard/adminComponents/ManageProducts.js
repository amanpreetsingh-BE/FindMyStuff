import { useRouter } from "next/router";

function ManageProducts({
  useState,
  useRef,
  Image,
  Modal,
  toast,
  productsJSON,
  authorization,
  t,
}) {
  /* Handle reload */
  const router = useRouter();
  /* Keychain menu state : open or closed */
  const [isKeychainMenu, setIsKeychainMenu] = useState(true);
  /* Sticker menu state : open or closed */
  const [isStickerMenu, setIsStickerMenu] = useState(true);
  /* Tracker menu state : open or closed */
  const [isTrackerMenu, setIsTrackerMenu] = useState(true);
  /* Other menu state : open or closed */
  const [isOtherMenu, setIsOtherMenu] = useState(true);

  const productClass =
    "grid place-items-center gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 max-w-7xl mx-auto px-8 py-16";
  const emptyProductClass =
    "flex justify-center items-center max-w-7xl mx-auto px-8 py-16";
  /* Get the the products for different categories (only those one possible) */

  const keychains = productsJSON[0];
  const stickers = productsJSON[1];
  const trackers = productsJSON[2];
  const others = productsJSON[3];

  const [modalProductModel, setModalProductModel] = useState("");
  const [modalProductColor, setModalProductColor] = useState("");
  const [modalProductQuantity, setModalProductQuantity] = useState("");
  const [modalProductStatus, setModalProductStatus] = useState("");
  const [modalProductKey, setModalProductKey] = useState("");
  const [modalCategory, setModalCategory] = useState("");
  const formProductStockIncrement = useRef();

  const [showKeychainModalProduct, setShowKeychainModalProduct] =
    useState(false);
  function openKeychainModalProduct() {
    setShowKeychainModalProduct((prev) => !prev);
  }
  const [showStickerModalProduct, setShowStickerModalProduct] = useState(false);
  function openStickerModalProduct() {
    setShowStickerModalProduct((prev) => !prev);
  }
  const [showTrackerModalProduct, setShowTrackerModalProduct] = useState(false);
  function openTrackerModalProduct() {
    setShowTrackerModalProduct((prev) => !prev);
  }
  const [showOtherModalProduct, setShowOtherModalProduct] = useState(false);
  function openOtherModalProduct() {
    setShowOtherModalProduct((prev) => !prev);
  }

  const renderProducts = (products, cat) => {
    const cards = [];

    function openStockModal(productName, color, quantity, status, key) {
      setModalProductModel(productName);
      setModalProductColor(color);
      setModalProductQuantity(quantity);
      setModalProductStatus(status);
      setModalProductKey(key);
      setModalCategory(cat);
      if (cat == "Keychain") {
        openKeychainModalProduct();
      } else if (cat == "Sticker") {
        openStickerModalProduct();
      } else if (cat == "Tracker") {
        openTrackerModalProduct();
      } else if (cat == "Other") {
        openOtherModalProduct();
      }
    }
    products.forEach((product) => {
      const name = product.id;
      if (product.colors) {
        const colors = product.colors;
        colors.forEach((color) => {
          cards.push(
            <div
              key={color.priceID}
              onClick={() =>
                openStockModal(
                  name,
                  color.color,
                  color.quantity,
                  color.status,
                  color.priceID
                )
              }
              className="flex flex-col justify-center items-center w-80 h-80 rounded-lg bg-[#1B212E] shadow-lg hover:shadow-lg hover:bg-[#171C26] cursor-pointer"
            >
              <div className="text-lg font-bold ">{name}</div>
              <div className="text-sm font-bold mb-8">{color.color}</div>
              <Image src={color.imageURL} width={196} height={196} alt="" />
            </div>
          );
        });
      } else {
        cards.push(
          <div
            key={product.data.priceID}
            onClick={() =>
              openStockModal(
                name,
                "No color",
                product.data.quantity,
                product.data.status,
                product.data.priceID
              )
            }
            className="flex flex-col justify-center items-center w-80 h-80 rounded-lg bg-[#1B212E] shadow-lg hover:shadow-lg hover:bg-[#171C26] cursor-pointer"
          >
            <div className="text-lg font-bold mb-8 ">{name}</div>
            <Image
              src={product.data.imageURL}
              width={196}
              height={196}
              alt=""
            />
          </div>
        );
      }
    });
    return cards;
  };

  const updateStock = async (e) => {
    const re = /^[0-9\\-]*$/;
    e.preventDefault();
    if (
      !re.test(formProductStockIncrement.current.value) ||
      formProductStockIncrement.current.value == ""
    ) {
      return toast.error("Merci d'ajouter uniquement des chiffres positives");
    } else {
      const data = {
        category: modalCategory,
        id: modalProductModel,
        color: modalProductColor,
        increment: formProductStockIncrement.current.value,
        authorization: authorization,
      };
      const response = await fetch("/api/products/modifyStock", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseJSON = await response.json();
      if (responseJSON.received) {
        toast.success("Successful stock update");
        return router.reload();
      } else {
        return toast.error(
          "Unsuccessful stock update, please contact amanpreet@outlook.be"
        );
      }
    }
  };
  const deleteProduct = async (e) => {
    e.preventDefault();
    const data = {
      category: modalCategory,
      id: modalProductModel,
      color: modalProductColor,
      priceID: modalProductKey,
      authorization: authorization,
    };
    const response = await fetch("/api/products/delete", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const responseJSON = await response.json();
    if (responseJSON.received) {
      toast.success("Successful delete");
      return router.reload();
    } else {
      return toast.error(
        "Unsuccessful delete, please contact amanpreet@outlook.be"
      );
    }
  };

  return (
    <div className="space-y-4 mt-20">
      <div className="flex font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
        {t("dashboard:admin:stockTitle")}
      </div>

      <div
        onClick={() => setIsKeychainMenu(!isKeychainMenu)}
        className="flex mb-8 bg-emerald-600 hover:bg-emerald-500 transition duration-150 ease-in-out rounded-lg mx-12 px-8 py-8 justify-center max-w-7xl xl:mx-auto items-center font-bold text-xl cursor-pointer shadow-lg"
      >
        Keychains
      </div>
      {isKeychainMenu ? (
        <div
          className={keychains.length > 0 ? productClass : emptyProductClass}
        >
          {keychains.length > 0 ? (
            renderProducts(keychains, "Keychain")
          ) : (
            <div>No Items</div>
          )}
          <div className="absolute">
            <Modal
              showModal={showKeychainModalProduct}
              setShowModal={setShowKeychainModalProduct}
            >
              <div className="w-full h-full flex flex-col justify-evenly items-center">
                <h1 className="text-2xl font-mono">Product Manager</h1>
                <ul className="list-disc font-medium">
                  <li>Product : {modalProductModel}</li>
                  <li>Color : {modalProductColor}</li>
                  <li>Quantity : {modalProductQuantity}</li>
                  <li>Status : {modalProductStatus}</li>
                  <li>Stripe key : {modalProductKey}</li>
                </ul>

                <div className="text-2xl outline-none bg-none">
                  <input
                    placeholder={"Add stock"}
                    type="number"
                    ref={formProductStockIncrement}
                    required
                  />
                </div>
                <button
                  onClick={updateStock}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white"
                >
                  Update stock
                </button>
                <button
                  onClick={deleteProduct}
                  className="px-8 py-4  bg-red-600 hover:bg-red-500 rounded-md text-white"
                >
                  Delete product
                </button>
              </div>
            </Modal>
          </div>
        </div>
      ) : (
        ""
      )}
      <div
        onClick={() => setIsStickerMenu(!isStickerMenu)}
        className="flex mb-8 bg-emerald-600 hover:bg-emerald-500 transition duration-150 ease-in-out rounded-lg mx-12 px-8 py-8 justify-center max-w-7xl xl:mx-auto items-center font-bold text-xl shadow-lg"
      >
        Stickers
      </div>
      {isStickerMenu ? (
        <div className={stickers.length > 0 ? productClass : emptyProductClass}>
          {stickers.length > 0 ? (
            renderProducts(stickers, "Sticker")
          ) : (
            <div>No Items</div>
          )}
          <div className="absolute">
            <Modal
              showModal={showStickerModalProduct}
              setShowModal={setShowStickerModalProduct}
            >
              <div className="w-full h-full flex flex-col justify-evenly items-center">
                <h1 className="text-2xl font-mono">Product Manager</h1>
                <ul className="list-disc font-medium">
                  <li>Product : {modalProductModel}</li>
                  <li>Color : {modalProductColor}</li>
                  <li>Quantity : {modalProductQuantity}</li>
                  <li>Status : {modalProductStatus}</li>
                  <li>Stripe key : {modalProductKey}</li>
                </ul>

                <div className="text-2xl outline-none bg-none">
                  <input
                    placeholder={"Add stock"}
                    type="number"
                    ref={formProductStockIncrement}
                    required
                  />
                </div>
                <button
                  onClick={updateStock}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white"
                >
                  Update stock
                </button>
                <button
                  onClick={deleteProduct}
                  className="px-8 py-4  bg-red-600 hover:bg-red-500 rounded-md text-white"
                >
                  Delete product
                </button>
              </div>
            </Modal>
          </div>
        </div>
      ) : (
        ""
      )}
      <div
        onClick={() => setIsTrackerMenu(!isTrackerMenu)}
        className="flex mb-8 bg-emerald-600 hover:bg-emerald-500 transition duration-150 ease-in-out rounded-lg mx-12 px-8 py-8 justify-center max-w-7xl xl:mx-auto items-center font-bold text-xl shadow-lg"
      >
        Trackers
      </div>
      {isTrackerMenu ? (
        <div className={trackers.length > 0 ? productClass : emptyProductClass}>
          {trackers.length > 0 ? (
            renderProducts(trackers, "Tracker")
          ) : (
            <div>No Items</div>
          )}
          <div className="absolute">
            <Modal
              showModal={showTrackerModalProduct}
              setShowModal={setShowTrackerModalProduct}
            >
              <div className="w-full h-full flex flex-col justify-evenly items-center">
                <h1 className="text-2xl font-mono">Product Manager</h1>
                <ul className="list-disc font-medium">
                  <li>Product : {modalProductModel}</li>
                  <li>Color : {modalProductColor}</li>
                  <li>Quantity : {modalProductQuantity}</li>
                  <li>Status : {modalProductStatus}</li>
                  <li>Stripe key : {modalProductKey}</li>
                </ul>
                <div className="text-2xl outline-none bg-none">
                  <input
                    placeholder={"Add stock"}
                    type="number"
                    ref={formProductStockIncrement}
                    required
                  />
                </div>
                <button
                  onClick={updateStock}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white"
                >
                  Update stock
                </button>
                <button
                  onClick={deleteProduct}
                  className="px-8 py-4  bg-red-600 hover:bg-red-500 rounded-md text-white"
                >
                  Delete product
                </button>
              </div>
            </Modal>
          </div>
        </div>
      ) : (
        ""
      )}
      <div
        onClick={() => setIsOtherMenu(!isOtherMenu)}
        className="flex mb-8 bg-emerald-600 hover:bg-emerald-500 transition duration-150 ease-in-out rounded-lg mx-12 px-8 py-8 justify-center max-w-7xl xl:mx-auto items-center font-bold text-xl shadow-lg"
      >
        Others
      </div>
      {isOtherMenu ? (
        <div className={others.length > 0 ? productClass : emptyProductClass}>
          {trackers.others > 0 ? (
            renderProducts(others, "Other")
          ) : (
            <div>No Items</div>
          )}
          <div className="absolute">
            <Modal
              showModal={showOtherModalProduct}
              setShowModal={setShowOtherModalProduct}
            >
              <div className="w-full h-full flex flex-col justify-evenly items-center">
                <h1 className="text-2xl font-mono">Product Manager</h1>

                <ul className="list-disc font-medium">
                  <li>Product : {modalProductModel}</li>
                  <li>Color : {modalProductColor}</li>
                  <li>Quantity : {modalProductQuantity}</li>
                  <li>Status : {modalProductStatus}</li>
                  <li>Stripe key : {modalProductKey}</li>
                </ul>

                <div className="text-2xl outline-none bg-none">
                  <input
                    placeholder={"Add stock"}
                    type="number"
                    ref={formProductStockIncrement}
                    required
                  />
                </div>
                <button
                  onClick={updateStock}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white"
                >
                  Update stock
                </button>
                <button
                  onClick={deleteProduct}
                  className="px-8 py-4  bg-red-600 hover:bg-red-500 rounded-md text-white"
                >
                  Delete product
                </button>
              </div>
            </Modal>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default ManageProducts;
