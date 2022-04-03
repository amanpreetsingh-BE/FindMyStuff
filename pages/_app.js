import "@styles/globals.css";
import { appWithTranslation } from "next-i18next";
import { Toaster } from "react-hot-toast";
import { UserContext } from "@lib/context";
import { useUserData } from "@lib/hooks";

function MyApp({ Component, pageProps }) {
  const userData = useUserData();

  return (
    <UserContext.Provider value={userData}>
      <Component {...pageProps} />
      <Toaster />
    </UserContext.Provider>
  );
}

export default appWithTranslation(MyApp);
