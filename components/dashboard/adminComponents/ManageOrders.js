function ManageOrders({ useState, locale, Modal, ordersJSON, toast, t }) {
  /* Modal variables states for orders */
  const [modalOrderCustomerEmail, setModalOrderCustomerEmail] = useState("");
  const [modalOrderShippingName, setModalOrderShippingName] = useState("");
  const [modalOrderCity, setModalOrderCity] = useState("");
  const [modalOrderLine1, setModalOrderLine1] = useState("");
  const [modalOrderLine2, setModalOrderLine2] = useState("");
  const [modalOrderPostalCode, setModalOrderPostalCode] = useState("");
  const [modalOrderEmailSent, setModalOrderEmailSent] = useState("");
  const [modalOrderCS, setModalOrderCS] = useState("");
  const [showModalOrder, setShowModalOrder] = useState(false);
  const [modalOrderShipped, setModalOrderShipped] = useState(false);
  const [modalOrderLocale, setModalOrderLocale] = useState("");

  const [loading, setLoading] = useState(false);

  function openModalOrder() {
    setShowModalOrder((prev) => !prev);
  }

  var tr = [];

  function openOrderModal(
    email,
    name,
    city,
    line1,
    line2,
    postal,
    emailSent,
    cs,
    shipped,
    locale
  ) {
    setModalOrderCustomerEmail(email);
    setModalOrderShippingName(name);
    setModalOrderCity(city);
    setModalOrderLine1(line1);
    setModalOrderLine2(line2);
    setModalOrderPostalCode(postal);
    setModalOrderEmailSent(emailSent);
    setModalOrderCS(cs);
    setModalOrderShipped(shipped);
    setModalOrderLocale(locale);
    openModalOrder();
  }

  ordersJSON.forEach((element) => {
    const email = element.customer_email;
    const locale = element.locale;
    const name = element.shipping_name;
    const city = element.shipping_address.city;
    const line1 = element.shipping_address.line1;
    const line2 = element.shipping_address.line2;
    const postal = element.shipping_address.postal_code;
    const cs = element.stripe_checkoutID;
    const shipped = element.shipped;
    const emailSent = element.emailSent
      ? "Confirmation email sent"
      : "Error sending confirmation email !";
    const bgColor = element.shipped ? "bg-emerald-600" : "bg-red-500";
    tr.push(
      <tr
        key={element.stripe_checkoutID}
        onClick={() =>
          openOrderModal(
            email,
            name,
            city,
            line1,
            line2,
            postal,
            emailSent,
            cs,
            shipped,
            locale
          )
        }
        className={
          "cursor-pointer border-b-2 border-b-[#1B212E] text-white font-medium last-of-type:border-b-emerald-600   " +
          bgColor
        }
      >
        <td className="px-4 py-7">{element.order_id}</td>
        <td className="px-4 py-7">{element.model}</td>
        <td className="px-4 py-7">{element.color}</td>
        <td className="px-4 py-7">{element.shipped ? "Shipped" : "Ordered"}</td>
      </tr>
    );
  });

  const updateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (modalOrderShipped) {
      return toast.error("Already marked as shipped !");
    }

    const data = {
      id: modalOrderCS,
      locale: modalOrderLocale,
      email: modalOrderCustomerEmail,
    };
    try {
      const response = await fetch(`/api/mailer/send-shipping-confirmation`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseJSON = await response.json();
      if (responseJSON.received) {
        toast.success("Shipping email sent !");
      } else {
        toast.error("Error .. Please contact amanpreet@outlook.be");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4 mt-20 ">
      <div className="flex font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
        {t("dashboard:admin:mOrders")}
      </div>
      <div className="overflow-y-scroll h-[600px]">
        <table className="border-collapse outline-none w-3/4 max-w-5xl mx-auto shadow-lg">
          <thead>
            <tr className="bg-[#1B212E] text-white text-left font-bold">
              <th className="px-4 py-4">Order ID</th>
              <th className="px-4 py-4">Model</th>
              <th className="px-4 py-4">Color</th>
              <th className="px-4 py-4">Status</th>
            </tr>
          </thead>
          {ordersJSON.length > 0 ? <tbody className="">{tr}</tbody> : ""}
        </table>
      </div>
      {ordersJSON.length > 0 ? (
        ""
      ) : (
        <div className="flex flex-col justify-center items-center text-white font-bold bg-[#1B212E] py-10  text-md  w-3/4 max-w-5xl mx-auto mt-10">
          No orders yet :(
        </div>
      )}

      <div className="absolute">
        <Modal showModal={showModalOrder} setShowModal={setShowModalOrder}>
          <div className="w-full h-full flex flex-col justify-evenly items-center">
            <h1 className="text-2xl font-mono">Order management</h1>
            <ul className="list-disc font-medium">
              <li>Customer email : {modalOrderCustomerEmail}</li>
              <li>Customer full name : {modalOrderShippingName}</li>
              <li>Line 1 : {modalOrderLine1}</li>
              <li>Line 2 : {modalOrderLine2}</li>
              <li>City : {modalOrderCity}</li>
              <li>Postal code : {modalOrderPostalCode}</li>
              <li>Confirmation email sent : {modalOrderEmailSent}</li>
              <li>Shipped : {`${modalOrderShipped} `}</li>
              <li>Locale used during checkout : {`${modalOrderLocale}`}</li>
            </ul>
            <button
              disabled={loading}
              onClick={updateOrder}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white"
            >
              Mark as shipped and send email
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default ManageOrders;
