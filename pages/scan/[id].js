/* React imports */
import {useState, useRef} from 'react'
/* Translate imports */
import {serverSideTranslations} from 'next-i18next/serverSideTranslations'
import {useTranslation} from 'next-i18next'

/* Built-in Next.js imports */
import Image from 'next/image'
import Script from 'next/script'
import Head from 'next/head'
import {useRouter} from 'next/router'

/* Various animations imports TOAST, AOS, REACT-SCROLL FRAMER-MOTION */
import {motion} from 'framer-motion';

/* Hero icons imports */
import {ChevronDoubleRightIcon} from '@heroicons/react/outline'
import {EyeOffIcon, EyeIcon} from '@heroicons/react/solid'

/* Swiper imports */
import {Swiper, SwiperSlide} from 'swiper/react';
import SwiperCore , {Pagination} from 'swiper/core';
import 'swiper/swiper.min.css';
import 'swiper/components/pagination/pagination.min.css';
import 'swiper/components/navigation/navigation.min.css';
SwiperCore.use([Pagination]);

/* Firebase components imports */
import {auth, firestore} from '@lib/firebase'
import {GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail} from 'firebase/auth'
import {writeBatch, doc, getDoc} from "firebase/firestore"

/* Custom components imports */
import Modal from '@components/misc/Modal'

/* Various animations imports */
import toast from 'react-hot-toast'

const variants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0},
}

/* Handle language */
export async function getServerSideProps({ req, params, locale }) {
    const id = params.id
    const navLocale = (((req.headers["accept-language"].split(";"))[0]).split(","))[0]

    const verify = await (fetch(`${process.env.HOSTNAME}/api/qr/${id}`))
    const verifyJSON = (await verify.json())

    if(verifyJSON.verified){
        const activate = verifyJSON.activate
        if(navLocale != locale){
            locale = navLocale
        }
    
        return {
            props: {
                ...(await serverSideTranslations(locale, ['scan'])),
                locale,
                id,
                activate
            },
        }
    } else {
        return {
            notFound: true
        }
    }
}

export default function ScanPage({id, activate}) {

  /* Handle language */
  const {t} = useTranslation();
  /* Import images */
  const icon = require('@images/icons/icon_white.svg');
  /* handle signup or sigin state and loaded user */
  const [signupState, setSignupState] = useState(false)
  /* Used to push to dashboard */
  const router = useRouter()
  /* handle form values through ref */
  const [formLoading, setFormLoading] = useState(false) /* is the form processing ? */
  const [isPwdVisible, setIsPwdVisible] = useState(false)
  const formFirstname = useRef()
  const formLastname = useRef()
  const formEmail = useRef()
  const formPassword = useRef()
  const formRepeatPassword = useRef()
  const formForgot = useRef()
  /* Handle Modal for forgot pwd */
  const [showModal, setShowModal] = useState(false)
  function openModal(){
      setShowModal(prev => !prev);
  }



  if(activate){
    return (
        <main>
            Activated
        </main>
      )
  } else {
    return (
      <>
        <Head>
          <link rel="stylesheet" type="text/css" href="https://unpkg.com/leaflet/dist/leaflet.css" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />  
        </Head>
        <Swiper slidesPerView={1} pagination={{bulletClass: 'swiper-pagination-bullet', clickable: 'true'}} className='h-screen font-nxt bg-primary text-white'>
            
            <SwiperSlide>
                <div className='flex justify-center items-center flex-col h-screen'>
                    <motion.div animate={{y:100}} transition={{duration:1}}>
                        <motion.div initial="hidden" animate="visible" variants={variants} transition={{duration:2}}  className='-mt-32 relative w-20 h-20 mx-auto'>
                            <Image src={icon} priority alt="logo" layout="fill"/>
                        </motion.div>
                    </motion.div>
                    <motion.div initial="hidden" animate="visible" variants={variants} transition={{duration:2}}  className='mt-24 font-bold mx-12 text-center'>
                        Welcome to the registration process. 
                    </motion.div>
                    <motion.div initial="hidden" animate="visible" variants={variants} transition={{duration:2}}  className='mt-2 font-medium text-sm mx-12 text-center'>
                        <motion.div animate={{color: ["#fff","#10b981", "#059668"]}} transition={{ ease: "easeIn", duration: 4 }}><ChevronDoubleRightIcon className='w-8 h-8'/></motion.div>
                    </motion.div>
                </div>
            </SwiperSlide>

            <SwiperSlide>
                <div className="w-full flex flex-col justify-start items-center h-full">

                </div>
            </SwiperSlide>
        </Swiper>

        </>
      )
  }
}