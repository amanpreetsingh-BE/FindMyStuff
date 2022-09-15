/* Icons */
import { ChevronDownIcon } from "@heroicons/react/outline";
/* Smooth scroll */
import { Link as LinkS } from "react-scroll";
import { useViewportScroll, useTransform } from "framer-motion";

function PitchSection({ useState, useEffect, Image, motion, t }) {
  const lostIllustration = require("@images/home/lost.png");
  const foundIllustration = require("@images/home/found.png");
  const [illustration, setIllustration] = useState(lostIllustration);
  const [illustrationText, setIllustrationText] = useState(
    t("home:why:pitch1")
  );
  const controlScrollHIW = () => {
    const base = window.innerHeight + 300;
    const offsetY = window.scrollY;

    if (offsetY <= base) {
      setIllustration(lostIllustration);
      setIllustrationText(t("home:why:pitch1"));
    } else {
      setIllustration(foundIllustration);
      setIllustrationText(t("home:why:pitch2"));
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", controlScrollHIW);
    return () => {
      window.removeEventListener("scroll", controlScrollHIW);
    };
  }, []);
  return (
    <section className="relative bg-primary w-full -mt-20">
      <div className="h-[1600px]">
        <div className="flex flex-col sm:flex-row sm:justify-center items-center justify-start sticky top-40 w-full h-[520px] min-h-[520px] mb-64">
          <div className="w-1/2 flex justify-center">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold max-w-sm text-center">
              {illustrationText}
            </div>
          </div>
          <div className="w-1/2 flex justify-center">
            <div
              className={
                "relative flex justify-center w-[200px] h-[370px] sm:w-[250px] sm:h-[462px] items-center group transition ease-in-out duration-[200ms] "
              }
            >
              <Image
                src={illustration}
                priority={true}
                layout="fill"
                alt="w1"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default PitchSection;
