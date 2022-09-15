/* Icons */
import { ChevronDownIcon } from "@heroicons/react/outline";
/* Smooth scroll */
import { Link as LinkS } from "react-scroll";

function HeroSection({ useState, useEffect, Image, motion, t }) {
  /* Handle Animation Opacity */
  const [showArrowDown, setShowArrowDown] = useState(true);
  const opacity = showArrowDown ? " opacity-100 " : " opacity-0 ";
  const controlScroll = () => {
    if (window.scrollY > 200) {
      setShowArrowDown(false);
    } else {
      setShowArrowDown(true);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", controlScroll);
    return () => {
      window.removeEventListener("scroll", controlScroll);
    };
  }, []);

  /* Import images */
  const homeIllustration = require("@images/home/homev1.5.png");
  return (
    <section className="relative flex flex-col items-center justify-center bg-primary w-full h-screen ">
      <div className="relative flex flex-col lg:flex-row items-center justify-evenly lg:justify-between px-12 max-w-7xl w-full h-3/4">
        <div className="order-last lg:order-first">
          <h1
            className={
              "relative text-white py-8 sm:py-0 font-extrabold text-center text-xl sm:text-3xl md:text-4xl lg:text-5xl "
            }
          >
            {t("home:heading")}
          </h1>
          <p
            className={
              "relative pt-4 lg:pt-8 text-gray-400 font-bold text-center lg:text-left text-xs max-w-xs sm:text-sm sm:max-w-sm md:text-md md:max-w-md lg:text-lg lg:max-w-lg transition ease-in-out duration-[200ms] "
            }
          >
            {t("home:description")}{" "}
          </p>
          <LinkS
            to="products"
            smooth={true}
            duration={500}
            spy={true}
            exact="true"
            offset={-96}
            className="cursor-pointer flex items-center justify-center lg:justify-start pt-8 font-bold transition ease-in-out duration-300 "
          >
            <div className="group cursor-pointer rounded-xl bg-secondary px-5 py-3 lg:px-8 lg:py-4 hover:bg-secondaryHover text-white font-extrabold transition ease-in-out duration-300">
              {t("home:homeBtn")}
            </div>
          </LinkS>
        </div>
        <motion.div>
          <div
            className={
              "relative flex justify-center items-center group w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80 transition ease-in-out duration-[200ms] "
            }
          >
            <div className="absolute -inset-5 lg:-inset-7 bg-gradient-to-r from-secondary to-secondaryHover rounded-full blur-xl opacity-75 group-hover:opacity-90 group-hover:duration-200 transition duration-200 "></div>
            <Image
              src={homeIllustration}
              priority={true}
              layout="fill"
              alt="home"
            />
          </div>
        </motion.div>
      </div>

      <div className="relative w-10 h-10 mb-10 py-8 sm:py-0">
        <ChevronDownIcon
          className={
            "animate-bounce text-white transition ease-in-out duration-[200ms] " +
            opacity
          }
        />
      </div>
    </section>
  );
}
export default HeroSection;
