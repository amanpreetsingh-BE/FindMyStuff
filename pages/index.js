/* React imports */
import {useState, useEffect} from 'react'

/* Built-in Next.js imports */
import Head from 'next/head'
import Image from 'next/image'

/* Custom components imports */
import MobileNav from '@components/navbar/MobileNav'
import Nav from '@components/navbar/Nav'
import HeroSection from '@components/index/HeroSection'
import HiwSection from '@components/index/HiwSection'
import ProductsSection from '@components/index/ProductsSection'
import ContactSection from '@components/index/ContactSection'
import FooterSection from '@components/index/FooterSection'

/* Various animations imports TOAST, AOS, REACT-SCROLL FRAMER-MOTION */
import toast from 'react-hot-toast'
import {motion} from 'framer-motion';

import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import {useTranslation} from 'next-i18next';


export async function getServerSideProps({locale}) {

  // Get products (stocks, models, colors, etc.) ; If internal error -> null
  let productsJSON

  try {
    let products = await (fetch(`${process.env.HOSTNAME}/api/products`))
    productsJSON = (await products.json())
  } catch(err){
    productsJSON = null
  }

  const hostname = process.env.HOSTNAME
  return {
    props: {
      ...(await serverSideTranslations(locale, ['home'])),
      locale,
      productsJSON,
      hostname
    },
  }
}

export default function Home({locale, productsJSON, hostname}) {

  /* Handle language */
  const {t} = useTranslation()

  /* Handle navbar */
  const [isOpen, setIsOpen] = useState(true)
  const toggle = () => {
      setIsOpen(!isOpen)
  };

  /* Import images */
  const separator = require('@images/home/separator.svg');

  return (
    <div>
      {/* Head SEO */}
      <Head>
        <title>FindMyStuff | Bringing back lost objects</title>
        <meta name="description" content="Plateform allowing to bring back lost object"/>
        <meta name="keywords" content="lost, object, phone, track, find" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Nav */}
      <Nav toggle={toggle} loc={locale} txt={t} />
      <MobileNav toggle={toggle} isOpen={isOpen} />

      {/* Main part including sections of landing page */}
      <main className='font-nxt'>
        {/* Hero Section  */}
        <HeroSection motion={motion} useState={useState} useEffect={useEffect} t={t} Image={Image} />

        {/* How It Works Section  */}
        <HiwSection motion={motion} useState={useState} useEffect={useEffect} t={t} Image={Image} />

        { /*Separator*/ }
        <div className="w-full bg-[#171C26] border-none outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#151515" fillOpacity="1" d="M0,160L80,144C160,128,320,96,480,106.7C640,117,800,171,960,197.3C1120,224,1280,224,1360,224L1440,224L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path></svg>
        </div>

        {/* Products */}
        <ProductsSection hostname={hostname} motion={motion} toast={toast} useState={useState} t={t} Image={Image} productsJSON={productsJSON} locale={locale} />

        {/* Contact */}
        <ContactSection useState={useState} hostname={hostname} t={t} toast={toast} />

        {/* Separator */}
        <div className="relative w-full h-[529px] min-h-[529px] bg-primary">
          <Image objectFit="cover" loading='eager' layout="fill" src={separator} alt="separator"/>
        </div>

        {/* Footer */}
        <FooterSection useState={useState} t={t} Image={Image} />
      </main>

    </div>
  )
}
