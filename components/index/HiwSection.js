/* Animations */
import {animateScroll as scroll} from 'react-scroll'
import {useViewportScroll, useTransform, useSpring} from 'framer-motion';
import {useInView} from 'react-intersection-observer';

function HiwSection({ Image, useState, useEffect, motion, t, Script }) {

    /* Handle framer animations */
    const {scrollY} = useViewportScroll();
    const yRange = useTransform(scrollY, [0, 500], [0, -50]);
    const dY = useSpring(yRange, {type:"tween"})
    const [ref, inView] = useInView({
        threshold: 0.5,
        triggerOnce: false
    });
    const variants = {
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0 
        },
        hidden: {
            opacity: 0,
            scale: 0.65,
            y: 50
        }
    };

    /* Import images */
    const phoneIllustration = require('@images/home/phone.png');
    const qrIllustration = require('@images/home/qr.png');
    const foundIllustration = require('@images/home/devices.png');

    /* Handle progressBar */
    const [illustration, setIllustration] = useState(qrIllustration)
    const [illustrationText, setIllustrationText] = useState(t('home:hiw:step1'))
    const [showStep, setShowStep] = useState([false, false, false])
    const stepColor = [showStep[0] ? " text-green-300 " : " text-gray-400 ", showStep[1] ? " text-green-300 " : " text-gray-400 ", showStep[2] ? " text-green-300 " : " text-gray-400 "]
    const stepBgOpacity = [showStep[0] ? " bg-green-300 " : " bg-transparent ", showStep[1] ? " bg-green-300 " : " bg-transparent ", showStep[2] ? " bg-green-300 " : " bg-transparent "]
    const stepBorderOpacity = [showStep[0] ? " border-green-300 " : " border-gray-400 ", showStep[1] ? " border-green-300 " : " border-gray-400 ", showStep[2] ? " border-green-300 " : " border-gray-400 "]
    const controlScrollHIW = () => {
        const base = window.innerHeight-96
        const offsetY = window.scrollY
    
        if(offsetY < base){
            setShowStep([false, false, false])
        } else if (offsetY > base && offsetY <= base+400){
            setIllustration(qrIllustration)
            setIllustrationText(t('home:hiw:step1'))
            setShowStep([true, false, false])
        } else if (offsetY > base +400 && offsetY <= base+800) {
            setIllustration(phoneIllustration)
            setIllustrationText(t('home:hiw:step2'))
            setShowStep([true, true, false])
        } else if(offsetY > base+800) {
            setIllustration(foundIllustration)
            setIllustrationText(t('home:hiw:step3'))
            setShowStep([true, true, true])
        } 
    }
    
    useEffect(() => {
        window.addEventListener('scroll', controlScrollHIW)
        return () => {
            window.removeEventListener('scroll', controlScrollHIW)
        }
    }, [])

    return(
        <section id="howitworks" className="relative bg-primary  w-full h-[1800px] ">
            <motion.div style={{ y: dY }} transition={{ ease: 'easeIn' }} className="flex flex-col items-center justify-start sticky top-36 sm:top-44 w-full h-[520px] min-h-[520px] mb-64">
                <div className="mt-10 text-gray-300 mb-16 font-bold text-2xl sm:text-3xl md:text-4xl">{t('home:hiw:title')}</div>
                <div className="flex flex-row  items-center justify-center w-full h-2/3 sm:h-full ">

                <div className="text-white hidden sm:relative sm:flex sm:items-center sm:justify-center h-full w-2/5 sm:w-2/6 sm:max-w-sm mt-5">
                    <div className="relative flex flex-col justify-center items-center h-full w-full">
                        <Script
                            src="./scripts/progressbar.js"
                        />
                        <div onClick={()=>scroll.scrollTo(window.innerHeight-96)} className={"cursor-pointer w-8 h-8 md:w-10 md:h-10 border-4 border-green-300 rounded-full ml-20 mb-4"+ stepBgOpacity[0] + stepBorderOpacity[0]}><div className={"absolute flex items-center justify-center w-32 -ml-32 text-green-300 font-bold text-base md:text-xl "+stepColor[0]}>{t('home:hiw:activate')}</div></div>
                        <div className="relative w-2 rounded-3xl bg-gray-700 h-1/5 ml-20 mb-4">
                            <div id="progress-bar" style={showStep[0] ? {boxShadow: '0px 0px 8px 1px #7FFFD4'}:{}} className="absolute w-2 bg-green-300 rounded-full h-0"></div>
                        </div>

                        <div onClick={()=>scroll.scrollTo(window.innerHeight+305)} className={"cursor-pointer w-8 h-8 md:w-10 md:h-10 border-4 border-green-300 rounded-full ml-20 mb-4"+ stepBgOpacity[1] + stepBorderOpacity[1]}><div className={"absolute flex items-center justify-center w-32 -ml-32 text-green-300 font-bold text-base md:text-xl "+stepColor[1]}>{t('home:hiw:lost')}</div></div>
                        <div className="relative w-2 rounded-3xl bg-gray-700 h-1/5 ml-20 mb-4">
                            <div id="progress-bar2" style={showStep[1] ? {boxShadow: '0px 0px 8px 1px #7FFFD4'}:{}} className="absolute w-2 bg-green-300 rounded-full h-0"></div>
                        </div>
                        
                        <div onClick={()=>scroll.scrollTo(window.innerHeight+705)} className={"cursor-pointer w-8 h-8 md:w-10 md:h-10 border-4 border-green-300 rounded-full ml-20"+ stepBgOpacity[2] + stepBorderOpacity[2]}><div className={"absolute flex items-center justify-center w-32 -ml-32 text-green-300 font-bold text-base md:text-xl "+stepColor[2]}>{t('home:hiw:found')}</div></div>
                    </div>
                </div>

                <div className="flex items-center justify-center h-full w-2/5 sm:w-2/6 sm:max-w-sm mt-5">
                    <motion.div
                    animate={inView ? 'visible' : 'hidden'}
                    variants={variants}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    ref={ref}
                    >
                        <div className="relative w-40 h-40 min-h-[10rem] sm:w-48 sm:h-48 sm:min-h-[12rem] md:w-60 md:h-60 md:min-h-[15rem] lg:w-80 lg:h-80 lg:min-h-[20rem] ">
                            <Image src={illustration} priority={true} layout="fill" alt="illustration"/>
                        </div>
                    </motion.div>
                </div>

                <div className="flex text-gray-300 font-bold text-center text-sm items-center justify-center h-full w-2/5 sm:w-2/6 sm:text-base md:text-lg sm:max-w-sm mt-5">
                    <div className="mx-2 sm:mx-6">{illustrationText}</div>
                </div>
                
                </div>

                <div className="relative mt-12 flex flex-row items-start justify-center w-full h-1/3 sm:hidden ">
                    <Script
                            src="./scripts/progressbar.js"
                    />
                    <div onClick={()=>scroll.scrollTo(window.innerHeight-96)} className={"cursor-pointer w-7 h-7 border-4 border-green-300 rounded-full mr-3 "+ stepBgOpacity[0] + stepBorderOpacity[0]}><div className={"absolute flex items-center w-1/3 left-0 mt-8 justify-center font-bold text-xl"+stepColor[0]}>{t('home:hiw:activate')}</div></div>
                    <div className="relative rounded-3xl w-1/5 bg-gray-700 mt-2.5 h-2 mr-3">
                        <div id="progress-bar3" style={showStep[0] ? {boxShadow: '0px 0px 8px 1px #7FFFD4'}:{}} className="absolute h-2 bg-green-300 rounded-full w-0"></div>
                    </div>
                    <div onClick={()=>scroll.scrollTo(window.innerHeight+305)} className={"cursor-pointer w-7 h-7 border-4 border-green-300 rounded-full mr-3"+ stepBgOpacity[1] + stepBorderOpacity[1]}><div className={"absolute flex items-center w-1/3 left-1/3 mt-8 justify-center font-bold text-xl"+stepColor[1]}>{t('home:hiw:lost')}</div></div>
                    <div className="relative rounded-3xl w-1/5 bg-gray-700 mt-2.5 h-2 mr-3">
                        <div id="progress-bar4" style={showStep[1] ? {boxShadow: '0px 0px 8px 1px #7FFFD4'}:{}} className="absolute h-2 bg-green-300 rounded-full w-0"></div>
                    </div>
                    <div onClick={()=>scroll.scrollTo(window.innerHeight+705)} className={"cursor-pointer w-7 h-7 border-4 border-green-300 rounded-full"+ stepBgOpacity[2] + stepBorderOpacity[2]}><div className={"absolute flex items-center w-1/3 left-2/3 mt-8 justify-center font-bold text-xl"+stepColor[2]}>{t('home:hiw:found')}</div></div>
                </div>

            </motion.div>
        </section>
    )
}
export default HiwSection