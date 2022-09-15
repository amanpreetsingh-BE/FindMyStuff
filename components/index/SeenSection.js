function SeenSection({ t, Image, motion }) {
  const L1 = require("@images/home/digital_wallonia_logo.png");
  const L2 = require("@images/home/mind_market.png");
  const L3 = require("@images/home/fondation_louvain.png");
  const L4 = require("@images/home/yncubator.png");
  const L5 = require("@images/home/kotplanet.png");
  const L6 = require("@images/home/lacapital.png");
  return (
    <section id="seen" className="bg-[#F4F4F4] py-12 ">
      <div className="flex items-center justify-center py-4  ">
        <span className=" text-2xl text-primary font-bold px-4 ">
          {t("home:seen:heading")}
        </span>
      </div>
      <div className="flex justify-center items-center  ">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="relative w-[180px] h-[180px] flex justify-center items-center">
            <div className="relative w-[100px] h-[66px] sm:w-[200px] sm:h-[132px]">
              <Image src={L1} priority={true} alt="L1" layout="fill" />
            </div>
          </div>
          <div className="relative w-[180px] h-[200180pxpx] flex justify-center items-center">
            <div className="relative w-[100px] h-[100px] sm:w-[200px] sm:h-[200px] ">
              <Image src={L2} priority={true} alt="L2" layout="fill" />
            </div>
          </div>
          <div className="relative w-[180px] h-[180px]  flex justify-center items-center">
            <div className="relative w-[58px] h-[20px] sm:w-[115px] sm:h-[41px]">
              <Image src={L3} priority={true} alt="L3" layout="fill" />
            </div>
          </div>
          <div className="relative w-[180px] h-[180px]  flex justify-center items-center">
            <div className="relative w-[100px] h-[23px] sm:w-[200px] sm:h-[46px]">
              <Image src={L6} priority={true} alt="L4" layout="fill" />
            </div>
          </div>
          <div className="relative w-[180px] h-[180px] flex justify-center items-center">
            <div className="relative w-[75px] h-[20px] sm:w-[150px] sm:h-[40px]">
              <Image src={L5} priority={true} alt="L5" layout="fill" />
            </div>
          </div>
          <div className="relative w-[180px] h-[180px]  flex justify-center items-center">
            <div className="relative w-[100px] h-[28px] sm:w-[200px] sm:h-[58px]">
              <Image src={L4} priority={true} alt="L4" layout="fill" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default SeenSection;
