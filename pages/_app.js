import "@styles/globals.css";
import { appWithTranslation } from "next-i18next";
import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}

export default appWithTranslation(MyApp);
