import AOS from "aos";
import "aos/dist/aos.css";

function WhySection({ useEffect, Image, motion, t }) {
  /* Import images */
  const A1 = require("@images/home/noReccurentFees.svg");
  const A2 = require("@images/home/easyToUse.svg");
  const A3 = require("@images/home/no_bat.svg");
  const A4 = require("@images/home/anonymous.svg");

  useEffect(() => {
    AOS.init({
      duration: 2000,
    });
  }, []);

  return (
    <section className="relative bg-primary w-full -mt-20">
      <div className="py-10 text-center text-white font-bold text-3xl md:text-4xl">
        {t("home:why:title")}
      </div>

      <div className="mx-12 lg:mx-auto max-w-5xl ">
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <div
            data-aos="fade-up"
            className="bg-secondaryHover col-span-1 lg:col-span-2 h-52 text-center px-4 flex flex-col justify-center items-center"
          >
            <div className="font-bold text-lg sm:text-xl">
              {t("home:why:desc")}
            </div>
          </div>
          <div
            data-aos="fade-up"
            className="bg-[#F4F4F4] text-primary px-4 h-52 flex flex-col justify-center items-center"
          >
            <div className="text-2xl w-full h-1/2 flex items-end justify-center font-bold">
              {t("home:why:h1")}
            </div>
            <div className="text-gray-800 h-1/2 text-sm text-center max-w-xs">
              {t("home:why:d1")}
            </div>
          </div>
          <div
            data-aos="fade-up"
            className="bg-[#F4F4F4] text-primary px-4 h-52 flex flex-col justify-center items-center"
          >
            <div className="text-2xl w-full h-1/2 flex items-end justify-center font-bold">
              {t("home:why:h2")}
            </div>
            <div className="text-gray-800 h-1/2 text-sm text-center max-w-xs">
              {t("home:why:d2")}
            </div>
          </div>
          <div
            data-aos="fade-up"
            className="bg-[#F4F4F4]  text-primary px-4 h-52 flex flex-col justify-center items-center"
          >
            <div className="text-2xl w-full h-1/2 flex items-end justify-center font-bold">
              {t("home:why:h3")}
            </div>
            <div className="text-gray-800 h-1/2 text-sm text-center max-w-xs">
              {t("home:why:d3")}
            </div>
          </div>
          <div
            data-aos="fade-up"
            className="bg-[#F4F4F4]   text-primary px-4 h-52 flex flex-col justify-center items-center"
          >
            <div className="text-2xl w-full h-1/2 flex items-end justify-center font-bold">
              {t("home:why:h4")}
            </div>
            <div className="text-gray-800 h-1/2 text-sm text-center max-w-xs">
              {t("home:why:d4")}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center flex-col my-20">
        <div className="mt-20 py-10  text-center text-white font-bold text-3xl md:text-4xl">
          {t("home:why:title2")}
        </div>
        {/*<div className="flex justify-center flex-col sm:flex-row space-x-12">*/}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col justify-center items-center w-64 h-64">
            <div className="relative w-[100px] h-[100px]">
              <Image src={A1} priority={true} alt="A1" layout="fill" />
            </div>
            <p className="text-lg font-bold pt-4 ">{t("home:why:k1")}</p>
            <p className="text-gray-300 text-center">{t("home:why:v1")}</p>
          </div>
          <div className="flex flex-col justify-center items-center w-64 h-64">
            <div className="relative w-[100px] h-[100px]">
              <Image src={A2} priority={true} alt="A2" layout="fill" />
            </div>
            <p className="text-lg font-bold pt-4 ">{t("home:why:k2")}</p>
            <p className="text-gray-300 text-center">{t("home:why:v2")}</p>
          </div>
          <div className="flex flex-col justify-center items-center w-64 h-64">
            <div className="relative w-[100px] h-[100px]">
              <Image src={A3} priority={true} alt="A3" layout="fill" />
            </div>
            <p className="text-lg font-bold pt-4 text-center">
              {t("home:why:k3")}
            </p>
            <p className="text-gray-300 text-center">{t("home:why:v3")}</p>
          </div>
          <div className="flex flex-col justify-center items-center w-64 h-64">
            <div className="relative w-[100px] h-[100px]">
              <Image src={A4} priority={true} alt="A4" layout="fill" />
            </div>
            <p className="text-lg font-bold pt-4 ">{t("home:why:k4")}</p>
            <p className="text-gray-300 text-center">{t("home:why:v4")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
export default WhySection;

/*

  const { scrollYProgress } = useViewportScroll();
  console.log(scrollYProgress.current);
  const pathLength = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
      <div className="flex flex-rows">
        <div className="w-[45%] border-2 flex justify-center">
          <div className="bg-secondaryHover w-96 h-96">
            <h2>Current U.S. market</h2>
            <p>
              In the United States alone, there are millions of lost items that
              never make it back to their rightful owners. We're changing that.{" "}
            </p>
          </div>
        </div>
        <div className="w-[10%] border-2 h-screen flex justify-center">
          <motion.svg
            viewBox="0 0 3 602"
            fill="none"
            className="inline-block h-full"
          >
            <motion.path
              d="M1.5 0.999603V601"
              style={{
                stroke: "url(#paint0_linear_1_4)",
                pathLength: pathLength,
                strokeWidth: "2",
                strokeLinecap: "round",
              }}
            />
            <defs>
              <linearGradient
                id="paint0_linear_1_4"
                x1="2"
                y1="0.999603"
                x2="2"
                y2="601"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#000" />
                <stop offset="1" stopColor="#FFF" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>
        <div className="w-[45%] border-2 flex justify-center">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 h-96 border-2">
            <div className="bg-[#F4F4F4] w-52 h-32">Le s</div>
            <div className="bg-[#F4F4F4] w-52 h-32">Le s</div>
            <div className="bg-[#F4F4F4] w-52 h-32">Le s</div>
            <div className="bg-[#F4F4F4] w-52 h-32">Le s</div>
            <div className="bg-[#F4F4F4] w-52 h-32">Le s</div>
            <div className="bg-[#F4F4F4] w-52 h-32">Le s</div>
          </div>
        </div>
      </div>
*/
