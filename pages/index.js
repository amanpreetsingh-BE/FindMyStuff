/* React.js */
import {useState, useEffect, useContext} from 'react'
/* Next.js */
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
/* Lib */
import { UserContext } from '@lib/context'
/* Components */
import MobileNav from '@components/navbar/MobileNav'
import Nav from '@components/navbar/Nav'
import HeroSection from '@components/index/HeroSection'
import HiwSectionDesk from '@components/index/HiwSectionDesk'
import HiwSectionMob from '@components/index/HiwSectionMob'
import ProductsSection from '@components/index/ProductsSection'
import ContactSection from '@components/index/ContactSection'
import FooterSection from '@components/index/FooterSection'
/* Animations */
import toast from 'react-hot-toast'
import {motion} from 'framer-motion';
/* Translation */
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import {useTranslation} from 'next-i18next';

export async function getServerSideProps({locale}) {
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

  const {t} = useTranslation()

  /* navbar */
  const [isOpen, setIsOpen] = useState(true)
  const toggle = () => {
      setIsOpen(!isOpen)
  };
  /* images */
  const separator = require('@images/home/separator.svg');
  /* control window width  */
  const [windowW, setWindowW] = useState('')
  const controlWindow = () => {
    setWindowW(window.innerWidth)
  }
  useEffect(() => {
      setWindowW(window.innerWidth)
      window.addEventListener('resize', controlWindow)
      return () => {
          window.removeEventListener('resize', controlWindow)
      }
  }, [])

  return (
    <div>
      {/* Head SEO */}
      <Head>
        <title>{t('home:seo:title')}</title>
        <meta name="description" content={t('home:seo:description')}/>
        <meta name="keywords" content={t('home:seo:description')} />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Nav */}
      <Nav useContext={useContext} UserContext={UserContext} Image={Image} Link={Link} toggle={toggle} locale={locale} t={t} />
      <MobileNav useContext={useContext} UserContext={UserContext} Image={Image} Link={Link} toggle={toggle} isOpen={isOpen} t={t} />

      {/* Main part including sections of landing page */}
      <main className='font-nxt'>
        {/* Hero Section  */}
        <HeroSection motion={motion} useState={useState} useEffect={useEffect} t={t} Image={Image} />

        {/* How It Works Section  */}
        { windowW <= 640 ?  
          <HiwSectionMob motion={motion} t={t} Image={Image} />
            : 
          <HiwSectionDesk motion={motion} useState={useState} useEffect={useEffect} t={t} Image={Image} Script={Script} />
        }
        
        { /*Separator */ }
        <div className='w-full'>
          <svg className='flex-no-shrink fill-current' id="visual" viewBox="0 0 900 200" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="900" height="600" fill="#171C26"></rect>
            <path d="M0 153L129 207L257 160L386 185L514 149L643 180L771 236L900 187L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z" fill="#171c26"></path>
            <path d="M0 136L129 133L257 195L386 125L514 178L643 184L771 160L900 141L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z" fill="#161b21"></path>
            <path d="M0 157L129 123L257 103L386 90L514 123L643 139L771 127L900 128L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z" fill="#16191d"></path>
            <path d="M0 104L129 87L257 102L386 60L514 81L643 60L771 86L900 71L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z" fill="#161719"></path>
            <path d="M0 57L129 46L257 42L386 25L514 35L643 60L771 54L900 55L900 0L771 0L643 0L514 0L386 0L257 0L129 0L0 0Z" fill="#171717"></path>
          </svg>
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
        <FooterSection useState={useState} hostname={hostname} t={t} Image={Image} />
      </main>

    </div>
  )
}
