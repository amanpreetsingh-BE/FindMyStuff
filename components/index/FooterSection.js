/* Built-in Next.js imports */
import Link from "next/link";

/* Import REACT-SCROLL*/
import { Link as LinkS } from "react-scroll";

function FooterSection({ t, Image, hostname }) {
  /* Import images */
  const footerLogo = require("@images/icons/icon_white.svg");
  const linkLogo = require("@images/icons/link.png");
  const fbLogo = require("@images/icons/fb.png");
  const instaLogo = require("@images/icons/insta.png");

  return (
    <footer
      id="footer"
      className="flex relative flex-row items-center justify-evenly bg-primary w-full h-60"
    >
      <div className="hidden md:flex md:justify-center md:items-center w-32">
        <div className="relative w-20 h-20">
          <a href="/">
            <Image src={footerLogo} loading="eager" layout="fill" alt="home" />
          </a>
        </div>
      </div>

      <div className="pt-8 ml-6 md:ml-0 relative w-48 pl-2 h-full">
        <div className="text-lg text-gray-50 font-bold mb-10">
          {t("home:footer:company")}
        </div>
        <ul className="space-y-1">
          <li className="cursor-pointer text-gray-300 hover:text-white text-xs transition ease-in-out duration-300 ">
            <Link passHref href="/about">
              {t("home:footer:companyAbout")}
            </Link>
          </li>
          <li className="cursor-pointer text-gray-300 hover:text-white text-xs transition ease-in-out duration-300 ">
            <Link passHref href="/career">
              {t("home:footer:companyCareer")}
            </Link>
          </li>
          <li className="cursor-pointer text-gray-300 hover:text-white text-xs transition ease-in-out duration-300 ">
            <Link passHref href="/terms">
              {t("home:footer:companyTerms")}
            </Link>
          </li>
          <li className="cursor-pointer text-gray-300 hover:text-white text-xs transition ease-in-out duration-300 ">
            <Link passHref href="/privacy">
              {t("home:footer:companyPrivacy")}
            </Link>
          </li>
        </ul>
      </div>

      <div className="pt-8 relative pl-8 w-48 h-full">
        <div className="text-lg text-gray-50 font-bold mb-10">
          {t("home:footer:help")}
        </div>
        <ul className="space-y-1">
          <li className="cursor-pointer text-xs text-gray-300 hover:text-white transition ease-in-out duration-300 ">
            <Link passHref href="/faq">
              {t("home:footer:helpFaq")}
            </Link>
          </li>
          <li>
            <LinkS
              to="contact"
              smooth={true}
              duration={500}
              spy={true}
              exact="true"
              offset={-80}
              className="cursor-pointer text-gray-300 hover:text-white text-xs transition ease-in-out duration-300 "
            >
              {t("home:footer:helpContact")}
            </LinkS>
          </li>
        </ul>
      </div>

      <div className="pt-8 relative w-52 h-full">
        <div className="text-lg text-gray-50 font-bold mb-10">
          {t("home:footer:social")}
        </div>
        <div className="space-x-2 md:space-x-3.5">
          <a
            href="https://www.linkedin.com/company/findmystuff-be/"
            target="_blank"
            rel="noreferrer"
          >
            <div className="cursor-pointer inline-block relative w-[30px] h-[30px] md:w-[48px] md:h-[48px]">
              <Image
                src={linkLogo}
                loading="eager"
                layout="fill"
                alt="linkedin"
              />
            </div>
          </a>
          <a
            href="https://www.facebook.com/findmystuff.be/"
            target="_blank"
            rel="noreferrer"
          >
            <div className="cursor-pointer inline-block relative w-[30px] h-[30px] md:w-[48px] md:h-[48px]">
              <Image
                src={fbLogo}
                loading="eager"
                layout="fill"
                alt="facebook"
              />
            </div>
          </a>
          <a
            href="https://www.instagram.com/findmystuff_be/"
            target="_blank"
            rel="noreferrer"
          >
            <div className="cursor-pointer inline-block relative w-[30px] h-[30px] md:w-[48px] md:h-[48px]">
              <Image
                src={instaLogo}
                loading="eager"
                layout="fill"
                alt="insta"
              />
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
}
export default FooterSection;
