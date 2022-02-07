/* React imports */
import {useState, useEffect} from 'react'

/* Built-in Next.js imports */
import Head from 'next/head'
import Image from 'next/image'

/* Custom components imports */
import MobileNav from '@components/navbar/MobileNav'
import Nav from '@components/navbar/Nav'
import HeroSection from '@components/index/HeroSection'

/* Various animations imports TOAST, AOS, REACT-SCROLL FRAMER-MOTION */
import toast from 'react-hot-toast'
import {motion} from 'framer-motion';

import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import {useTranslation} from 'next-i18next';

/* Import hostname */
import {hostname} from '@lib/host'

export async function getServerSideProps({locale}) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['home'])),
      locale,
    },
  }
}

export default function Home({locale}) {

  /* Handle language */
  const {t} = useTranslation()

  /* Handle navbar */
  const [isOpen, setIsOpen] = useState(true)
  const toggle = () => {
      setIsOpen(!isOpen)
  };


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

      </main>

    </div>
  )
}
