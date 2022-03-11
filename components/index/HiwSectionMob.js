/* Animations */
import {animateScroll as scroll} from 'react-scroll'
import {useViewportScroll, useTransform, useSpring} from 'framer-motion';
import {useInView} from 'react-intersection-observer';

/* Swiper */
import {Swiper, SwiperSlide} from 'swiper/react';
import SwiperCore , {Pagination} from 'swiper/core';
import 'swiper/swiper.min.css';
import 'swiper/components/pagination/pagination.min.css';
import 'swiper/components/navigation/navigation.min.css';
SwiperCore.use([Pagination]);

function HiwSectionMob({ Image, useState, useEffect, motion, t, Script }) {

    /* Handle framer animations */
    const {scrollY} = useViewportScroll();
    const yRange = useTransform(scrollY, [0, 500], [0, -50]);
    const dY = useSpring(yRange, {type:"tween"})
    const [ref, inView] = useInView({
        threshold: 0.5,
        triggerOnce: true
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
    const qrIllustration = require('@images/home/qr.png');
    const phoneIllustration = require('@images/home/phone.png');
    const foundIllustration = require('@images/home/devices-min.png');

    return(
        <section id="howitworks" className="relative bg-primary w-full">
                <div className="py-10 flex justify-center items-center text-gray-300 font-bold text-2xl sm:text-3xl md:text-4xl">{t('home:hiw:title')}</div>
                <Swiper slidesPerView={1} pagination={{bulletClass: 'swiper-pagination-bullet', clickable: 'true'}} className='h-[60vh] min-h-[500px] bg-primary '>

                    <SwiperSlide>
                        <div className='flex justify-center h-full items-center flex-col'>
                            <div className='h-1/2 flex items-center'>
                                <motion.div
                                    animate={inView ? 'visible' : 'hidden'}
                                    variants={variants}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    ref={ref}
                                >
                                    <div className='relative w-52 h-52'>
                                        <Image src={qrIllustration} priority={true} layout="fill" alt="illustration1"/>
                                    </div>
                                </motion.div>
                            </div>

                            <div className='text-gray-300 h-1/2 mx-24 font-bold text-center flex items-start pt-4 pb-8 justify-center'>
                                {t('home:hiw:step1')}
                            </div>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className='flex justify-center h-full items-center flex-col'>
                            <div className='h-1/2 flex items-center'>
                                <div className='relative w-52 h-52'>
                                    <Image src={phoneIllustration} priority={true} layout="fill" alt="illustration2"/>
                                </div>
                            </div>

                            <div className='text-gray-300 h-1/2 mx-24 font-bold text-center flex items-start pt-4 pb-8 justify-center'>
                                {t('home:hiw:step2')}
                            </div>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className='flex justify-center h-full items-center flex-col'>
                            <div className='h-1/2 flex items-center'>
                                <div className='relative w-52 h-52'>
                                    <Image src={foundIllustration} priority={true} layout="fill" alt="illustration3"/>
                                </div>
                            </div>

                            <div className='text-gray-300 h-1/2 mx-24 font-bold text-center flex items-start pt-4 pb-8 justify-center'>
                                {t('home:hiw:step3')}
                            </div>
                        </div>
                    </SwiperSlide>

                </Swiper>
            
        </section>
    )
}
export default HiwSectionMob