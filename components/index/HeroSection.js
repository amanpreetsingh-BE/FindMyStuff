/* Hero icons imports */
import {ChevronDownIcon} from '@heroicons/react/outline'

function HeroSection({ useState, useEffect, Image, motion, t }) {
      /* Handle Animation Opacity */
    const [showArrowDown, setShowArrowDown] = useState(true)
    const opacity = showArrowDown ? " opacity-100 " : " opacity-0 "
    const controlScroll = () => {
        if(window.scrollY > 200){
            setShowArrowDown(false)
        } else {
            setShowArrowDown(true)
        }
    }
    useEffect(() => {
        window.addEventListener('scroll', controlScroll)
        return () => {
            window.removeEventListener('scroll', controlScroll)
        }
    }, [])
    
    /* Import images */
    const homeIllustration = require('@images/home/home-min.png');

    return(
        <section className="relative flex flex-col items-center justify-evenly bg-primary w-full h-screen -mt-20">
            <motion.div whileHover={{ scale: 1.05 }} initial={{opacity:0}} animate={{opacity:1}}>
                <div className={"relative flex justify-center items-center group mt-40 w-56 h-56 min-h-[14rem] sm:w-64 sm:h-64 transition ease-in-out duration-[200ms] " + opacity}>
                    <div className="absolute -inset-5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur-xl opacity-75 group-hover:opacity-100 group-hover:duration-200 transition duration-200 animate-tilt"></div>
                    <Image src={homeIllustration} priority layout="fill" alt="home"/>
                </div>
            </motion.div>
            <h1 className={"relative mt-5 text-white font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-6xl transition ease-in-out duration-[200ms] "+opacity}>{t('home:heading')}</h1>
            <p className={"relative mt-5 mb-2 text-gray-400 font-bold text-center text-xs max-w-xs sm:text-sm sm:max-w-sm md:text-md md:max-w-md lg:text-lg lg:max-w-lg transition ease-in-out duration-[200ms] " + opacity}>{t('home:description')} </p>
            <div className="mt-5 relative w-10 h-10">
                <ChevronDownIcon className={"animate-bounce text-white transition ease-in-out duration-[200ms] " + opacity} />
            </div>
        </section>
    )
}
export default HeroSection