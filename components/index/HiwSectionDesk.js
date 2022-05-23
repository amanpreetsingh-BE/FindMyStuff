/* Animations */
import { animateScroll as scroll } from "react-scroll";
import { useInView } from "react-intersection-observer";

function HiwSection({ Image, useState, useEffect, motion, t, Script }) {
  /* Handle framer animations */
  const [ref, inView] = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });
  const variants = {
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    hidden: {
      opacity: 0,
      scale: 0.65,
      y: 50,
    },
  };

  /* Import images */
  const phoneIllustration = require("@images/home/phone-.png");
  const apposeIllustration = require("@images/home/devicesv1.5.png");
  const foundIllustration = require("@images/home/happyEnd.png");

  /* Handle progressBar */
  const [illustration, setIllustration] = useState(apposeIllustration);
  const [illustrationText, setIllustrationText] = useState(t("home:hiw:step1"));
  const [showStep, setShowStep] = useState([false, false, false]);
  const stepColor = [
    showStep[0] ? " text-secondary " : " text-gray-400 ",
    showStep[1] ? " text-secondary " : " text-gray-400 ",
    showStep[2] ? " text-secondary " : " text-gray-400 ",
  ];
  const stepBgOpacity = [
    showStep[0] ? " bg-secondary " : " bg-transparent ",
    showStep[1] ? " bg-secondary " : " bg-transparent ",
    showStep[2] ? " bg-secondary " : " bg-transparent ",
  ];
  const stepBorderOpacity = [
    showStep[0] ? " border-secondary " : " border-gray-400 ",
    showStep[1] ? " border-secondary " : " border-gray-400 ",
    showStep[2] ? " border-secondary" : " border-gray-400 ",
  ];
  const controlScrollHIW = () => {
    const base = window.innerHeight - 96;
    const offsetY = window.scrollY;

    if (offsetY < base) {
      setShowStep([false, false, false]);
    } else if (offsetY > base && offsetY <= base + 400) {
      setIllustration(apposeIllustration);
      setIllustrationText(t("home:hiw:step1"));
      setShowStep([true, false, false]);
    } else if (offsetY > base + 400 && offsetY <= base + 800) {
      setIllustration(phoneIllustration);
      setIllustrationText(t("home:hiw:step2"));
      setShowStep([true, true, false]);
    } else if (offsetY > base + 800) {
      setIllustration(foundIllustration);
      setIllustrationText(t("home:hiw:step3"));
      setShowStep([true, true, true]);
    }
  };

  useEffect(() => {
    doScrollAnimation();
    window.addEventListener("scroll", controlScrollHIW);
    return () => {
      window.removeEventListener("scroll", controlScrollHIW);
    };
  }, []);

  const doScrollAnimation = () => {
    let progressBar = document.querySelector("#progress-bar");
    let progressBar2 = document.querySelector("#progress-bar2");

    function updateProgressBar() {
      progressBar.style.height = `${getScrollPercentage()}%`;
      progressBar2.style.height = `${getScrollPercentage2()}%`;
      requestAnimationFrame(updateProgressBar);
    }

    function getScrollPercentage() {
      if (window.scrollY > window.innerHeight - 96) {
        return Math.min(
          ((window.scrollY - (window.innerHeight - 96)) / 400) * 100,
          100
        );
      } else {
        return 0;
      }
    }

    function getScrollPercentage2() {
      if (window.scrollY > window.innerHeight + 305) {
        return Math.min(
          ((window.scrollY - 404 - (window.innerHeight - 96)) / 404) * 100,
          100
        );
      } else {
        return 0;
      }
    }

    updateProgressBar();
  };

  return (
    <section id="howitworks" className="relative bg-primary w-full h-[1800px]">
      <div className="flex flex-col items-center justify-start sticky top-40 w-full h-[520px] min-h-[520px] mb-64">
        <div className="py-10 text-gray-300 font-bold text-3xl md:text-4xl">
          {t("home:hiw:title")}
        </div>

        <div className="flex flex-row items-center justify-center w-full h-full ">
          <div className="text-white ml-8 lg:mx-12 relative flex items-center justify-center h-full w-1/4 max-w-xs">
            <div className="relative flex flex-col justify-center items-center h-full w-full">
              <div
                onClick={() => scroll.scrollTo(window.innerHeight - 96)}
                className={
                  "cursor-pointer w-8 h-8 md:w-10 md:h-10 border-4 border-secondary rounded-full ml-20 mb-4" +
                  stepBgOpacity[0] +
                  stepBorderOpacity[0]
                }
              >
                <div
                  className={
                    "absolute flex items-center justify-center text-center w-32 -ml-40 text-secondary font-bold text-base md:text-xl " +
                    stepColor[0]
                  }
                >
                  {t("home:hiw:activate")}
                </div>
              </div>

              <div className="relative w-2 rounded-3xl bg-gray-700 h-1/5 ml-20 mb-4">
                <div
                  id="progress-bar"
                  style={
                    showStep[0] ? { boxShadow: "0px 0px 8px 1px #7FFFD4" } : {}
                  }
                  className="absolute w-2 bg-secondary rounded-full h-0"
                ></div>
              </div>

              <div
                onClick={() => scroll.scrollTo(window.innerHeight + 305)}
                className={
                  "cursor-pointer w-8 h-8 md:w-10 md:h-10 border-4 border-secondary rounded-full ml-20 mb-4" +
                  stepBgOpacity[1] +
                  stepBorderOpacity[1]
                }
              >
                <div
                  className={
                    "absolute flex items-center justify-center text-center w-32 -ml-40 text-secondary font-bold text-base md:text-xl " +
                    stepColor[1]
                  }
                >
                  {t("home:hiw:lost")}
                </div>
              </div>

              <div className="relative w-2 rounded-3xl bg-gray-700 h-1/5 ml-20 mb-4">
                <div
                  id="progress-bar2"
                  style={
                    showStep[1] ? { boxShadow: "0px 0px 8px 1px #7FFFD4" } : {}
                  }
                  className="absolute w-2 bg-secondary rounded-full h-0"
                ></div>
              </div>

              <div
                onClick={() => scroll.scrollTo(window.innerHeight + 705)}
                className={
                  "cursor-pointer w-8 h-8 md:w-10 md:h-10 border-4 border-secondary rounded-full ml-20" +
                  stepBgOpacity[2] +
                  stepBorderOpacity[2]
                }
              >
                <div
                  className={
                    "absolute flex items-center justify-center text-center w-32 -ml-40 text-secondary font-bold text-base md:text-xl " +
                    stepColor[2]
                  }
                >
                  {t("home:hiw:found")}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center justify-center h-full w-1/2 max-w-xs `}
          >
            <motion.div
              animate={inView ? "visible" : "hidden"}
              variants={variants}
              transition={{ duration: 1, ease: "easeOut" }}
              ref={ref}
            >
              <div
                className={
                  "relative w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-80 lg:h-80"
                }
              >
                <Image
                  src={illustration}
                  priority={true}
                  layout="fill"
                  alt="illustration"
                />
              </div>
            </motion.div>
          </div>

          <div
            className={`flex mr-8 lg:mx-12 text-gray-300 font-bold text-center text-sm  items-center justify-center h-full w-1/4 md:text-lg max-w-xs`}
          >
            {illustrationText}
          </div>
        </div>
      </div>
    </section>
  );
}
export default HiwSection;
