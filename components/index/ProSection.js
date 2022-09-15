/* React imports */
import { useRef } from "react";

function ProSection({ t, useState, toast }) {
  return (
    <section
      id="pro"
      className="flex p-12 text-white flex-col items-center justify-evenly bg-[#171717] w-full h-[500px] "
    >
      <div className="w-full text-center sm:pt-0 border-white font-bold  text-lg sm:text-xl">
        {t("home:pro:h1")}
      </div>

      <div className="max-w-3xl text-center pt-8">{t("home:pro:d1")}</div>
      <div className="max-w-3xl text-center pt-8 font-bold">
        {t("home:pro:d2")}
      </div>
      <div className="max-w-3xl text-center pt-8 font-bold underline">
        <a href="mailto:team@findmystuff.io">
          {t("home:pro:d3")} via team@findmystuff.io
        </a>
      </div>
    </section>
  );
}
export default ProSection;
