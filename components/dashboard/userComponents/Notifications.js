import { XIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";

export default function Notifications({
  useState,
  t,
  toast,
  email,
  userNotificationsJSON,
  uid,
  oob,
}) {
  const notifClass = "grid place-items-center gap-8 grid-cols-1 mx-auto ";
  const emptyNotifsClass =
    "flex justify-center items-center max-w-7xl mx-auto px-8 py-16";
  const [notifs, setNotifs] = useState(true);
  const [clearing, setClearing] = useState(false);
  /* Used to push to dashboard */
  const router = useRouter();
  const clearNotif = async (e) => {
    e.preventDefault();
    setClearing(true);
    try {
      const data = {
        email: email,
        oob: oob,
        uid: uid,
      };

      await fetch(`/api/user/clearNotifications`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      setNotifs(false);
      toast.success(t("dashboard:user:notifPage:cleared"));
      router.reload();
    } catch (err) {
      return toast.error(err.message);
    }
  };

  const renderNotif = (notifications) => {
    const cards = [];
    var k = 0;
    notifications.forEach((qr) => {
      //push delivery notif
      var id = qr.id;
      qr.delivery.forEach((nd) => {
        k += 1;
        cards.push(
          <div
            key={nd.timestamp + k}
            className="flex flex-col justify-center px-8 py-12 items-center w-full h-12 rounded-lg bg-[#1B212E] shadow-lg hover:shadow-lg"
          >
            <div className="text-lg font-bold ">{id}</div>
            <div className="text-emerald-500 font-bold text-sm">
              {t("dashboard:user:notifPage:sent")}{" "}
              {new Date(nd.timestamp * 1000).toLocaleString()}
            </div>
          </div>
        );
      });
      qr.scan.forEach((ns) => {
        k += 1;
        cards.push(
          <div
            key={ns.timestamp + k}
            className={
              "flex flex-col justify-center cursor-pointer px-8 py-12 items-center w-full h-12 rounded-lg bg-[#1c222e] shadow-lg hover:shadow-lg"
            }
          >
            <div className="text-lg font-bold ">{id}</div>
            <div className="text-emerald-500 font-bold text-sm">
              {t("dashboard:user:notifPage:scanned")}{" "}
              {new Date(ns.timestamp * 1000).toLocaleString()}
            </div>
          </div>
        );
      });
    });

    if (cards.length == 0) {
      return (
        <div className="text-center max-w-xs">
          {t("dashboard:user:notifPage:empty1")}
        </div>
      );
    } else {
      return (
        <>
          <div className="flex w-full justify-end items-center ">
            <button
              disabled={clearing}
              onClick={clearNotif}
              className="flex px-2 py-2 rounded-lg cursor-pointer"
            >
              <XIcon className="text-red-400 w-6 h-6" />
            </button>
          </div>
          {cards}
        </>
      );
    }
  };

  return (
    <>
      <div className="mt-20 mx-12 lg:mx-auto px-12 py-12 bg-[#1B212E] max-w-4xl ">
        <div className="flex text-center font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
          {t("dashboard:user:notifPage:heading")}
        </div>

        <div
          className={
            userNotificationsJSON.length > 0 ? notifClass : emptyNotifsClass
          }
        >
          {userNotificationsJSON.length > 0 && notifs ? (
            renderNotif(userNotificationsJSON)
          ) : (
            <div className="text-center max-w-sm">
              {t("dashboard:user:notifPage:empty1")}
            </div>
          )}
        </div>
      </div>

      <div className="h-20"></div>
    </>
  );
}
