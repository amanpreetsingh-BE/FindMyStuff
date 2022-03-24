/* Smooth scroll */
import { Link as LinkS, animateScroll as scroll } from "react-scroll";
/* Icons */
import { MenuAlt3Icon } from "@heroicons/react/outline";
/* Components */
import LanguageBox from "@components/misc/LanguageBox";

function Nav({ Image, Link, locale, isConnected, toggle, t }) {
  const logo = require("@images/icons/logo_white.svg");
  function toggleHome() {
    scroll.scrollToTop();
  }

  return (
    <nav className="z-20 font-nxt flex top-0 sticky h-24 bg-primary">
      <div className="flex justify-between pl-10 pr-10 h-full w-full">
        <Link passHref href="/" onClick={toggleHome}>
          <div className="hidden ml-1 lg:pt-3 lg:flex lg:h-full lg:justify-center lg:items-center">
            <Image
              className={"cursor-pointer"}
              src={logo}
              width={"200"}
              height={"40"}
              alt={"logo"}
            />
          </div>
        </Link>

        <div
          onClick={toggle}
          className="z-index-20 flex items-center justify-center h-full lg:hidden"
        >
          <MenuAlt3Icon className="text-white cursor-pointer h-8 " />
        </div>

        <div className="z-index-20 flex items-center justify-center h-full lg:hidden">
          <LanguageBox locale={locale} Image={Image} />
        </div>

        <ul
          className={
            "lg:flex lg:h-full lg:list-none lg:text-center hidden text-white"
          }
        >
          <li className="flex justify-center items-center h-full">
            <LinkS
              to="howitworks"
              activeClass="border-b-2 border-b-secondary"
              smooth={true}
              duration={500}
              spy={true}
              exact="true"
              offset={-96}
              className="cursor-pointer flex items-center h-full mr-10 font-bold transition ease-in-out duration-300"
            >
              {t("home:nav:how")}
            </LinkS>
          </li>
          <li className="flex justify-center items-center h-full">
            <LinkS
              to="products"
              activeClass="border-b-2 border-b-secondary"
              smooth={true}
              duration={500}
              spy={true}
              exact="true"
              offset={-96}
              className="cursor-pointer flex items-center h-full mr-10 font-bold transition ease-in-out duration-300 "
            >
              {t("home:nav:prod")}
            </LinkS>
          </li>
          <li className="flex justify-center items-center h-full">
            <LinkS
              to="contact"
              smooth={true}
              activeClass="border-b-2 border-b-secondary"
              duration={500}
              spy={true}
              exact="true"
              offset={-96}
              className="cursor-pointer flex items-center h-full mr-10 font-bold transition ease-in-out duration-300 "
            >
              {t("home:nav:contact")}
            </LinkS>
          </li>
          <li className="flex justify-center items-center h-full">
            <Link passHref href={isConnected ? "/dashboard" : "/sign"}>
              <div className="group cursor-pointer mr-10 rounded-xl bg-secondary px-8 py-4 hover:bg-secondaryHover text-white font-extrabold transition ease-in-out duration-300">
                {isConnected ? t("home:nav:gotodash") : t("home:nav:sign")}{" "}
                &nbsp; &rarr;
              </div>
            </Link>
          </li>

          <li className="flex justify-center items-center h-full">
            <LanguageBox locale={locale} Image={Image} />
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Nav;
