/* React.js */
import {useState} from 'react'
/* Next imports */
import Image from 'next/image'

/* Custom components imports */
import NavReduced from '@components/navbar/NavReduced'
import FooterSection from '@components/index/FooterSection'

/* Translate imports */
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

/* Handle language */
export async function getStaticProps({ locale }){
  const hostname = process.env.HOSTNAME
  return {
    props: {
      ...(await serverSideTranslations(locale, ['privacy','home'])),
      locale,
      hostname
    }
  }
}

export default function Privacy(props) {

  /* Handle language */
  const {t} = useTranslation();

  return (
    <main className="bg-primary text-white">
      <NavReduced darkLogo={false} />

      <h1 className=" text-xl sm:text-2xl font-bold w-1/2 min-w-[300px] max-w-[640px] border-b-4 border-secondary flex items-end justify-end my-10">{t('privacy:Heading')}</h1>

      <div className="flex flex-col mx-10">
        <h2 className="  bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('privacy:h1')}</h2>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p1')} <br/> <br/> {t('privacy:p2')}</p>
        <h2 className="  bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('privacy:h2')}</h2>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p3')} <br/> <br/> {t('privacy:p4')} <br/> <br/> {t('privacy:p5')} <br/> <br/> {t('privacy:p6')}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('privacy:h3')}</h2>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p7')} <br/> <br/> {t('privacy:p8')}</p>
        <ul className=" text-base font-medium mb-5 px-12 list-disc">
          <li>{t('privacy:li1')}</li>
          <li>{t('privacy:li2')}</li>
          <li>{t('privacy:li3')}</li>
          <li>{t('privacy:li4')}</li>
        </ul>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p3')} <br/> <br/> {t('privacy:p9')} <br/> <br/> {t('privacy:p10')} <br/> <br/> {t('privacy:p11')} <br/> <br/> {t('privacy:p12')} <br/> <br/> {t('privacy:p13')} <br/> <br/> {t('privacy:p14')} <br/> <br/> {t('privacy:p15')}</p>
        <ul className=" text-base font-medium mb-5 px-12 list-disc">
          <li>{t('privacy:li5')}</li>
          <li>{t('privacy:li6')}</li>
          <li>{t('privacy:li7')}</li>
          <li>{t('privacy:li8')}</li>
          <li>{t('privacy:li9')}</li>
          <li>{t('privacy:li10')}</li>
          <li>{t('privacy:li11')}</li>
          <li>{t('privacy:li12')}</li>
          <li>{t('privacy:li13')}</li>
        </ul>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('privacy:h4')}</h2>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p16')} <br/> <br/> {t('privacy:p17')} <br/> <br/> {t('privacy:p18')} <br/> <br/> {t('privacy:p19')}</p>
        <ul className=" text-base font-medium mb-5 px-12 list-disc">
          <li>{t('privacy:li14')}</li>
          <li>{t('privacy:li15')}</li>
          <li>{t('privacy:li16')}</li>
          <li>{t('privacy:li17')}</li>
        </ul>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p20')} <br/> <br/> {t('privacy:p21')} <br/> <br/> {t('privacy:p22')}</p>
        <ul className=" text-base font-medium mb-5 px-12 list-disc">
          <li>{t('privacy:li18')}</li>
          <li>{t('privacy:li19')}</li>
          <li>{t('privacy:li20')}</li>
        </ul>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('privacy:h5')}</h2>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p23')}</p>
        <ul className=" text-base font-medium mb-5 px-12 list-disc">
          <li>{t('privacy:li21')}</li>
          <li>{t('privacy:li22')}</li>
          <li>{t('privacy:li23')}</li>
          <li>{t('privacy:li24')}</li>
          <li>{t('privacy:li25')}</li>
          <li>{t('privacy:li26')}</li>
          <li>{t('privacy:li27')}</li>
          <li>{t('privacy:li28')}</li>
          <li>{t('privacy:li29')}</li>
          <li>{t('privacy:li30')}</li>
          <li>{t('privacy:li31')}</li>
        </ul>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p24')} <br/> <br/> {t('privacy:p25')}</p>
        <ul className=" text-base font-medium mb-5 px-12 list-disc">
          <li>{t('privacy:li32')}</li>
          <li>{t('privacy:li33')}</li>
          <li>{t('privacy:li34')}</li>
          <li>{t('privacy:li35')}</li>
          <li>{t('privacy:li36')}</li>
          <li>{t('privacy:li37')}</li>
        </ul>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p26')}</p>
        <ul className=" text-base font-medium mb-5 px-12 list-disc">
          <li>{t('privacy:li38')}</li>
          <li>{t('privacy:li39')}</li>
          <li>{t('privacy:li40')}</li>
          <li>{t('privacy:li41')}</li>
          <li>{t('privacy:li42')}</li>
        </ul>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p27')}</p>
        <ul className=" text-base font-medium mb-5 px-12 list-disc">
          <li>{t('privacy:li43')}</li>
          <li>{t('privacy:li44')}</li>
          <li>{t('privacy:li45')}</li>
          <li>{t('privacy:li46')}</li>
          <li>{t('privacy:li47')}</li>
          <li>{t('privacy:li48')}</li>
        </ul>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p28')} <br/> <br/> {t('privacy:p29')}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('privacy:h6')}</h2>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p30')}</p>
        <ul className=" text-base font-medium mb-5 px-12 list-disc">
          <li>{t('privacy:li49')}</li>
          <li>{t('privacy:li50')}</li>
          <li>{t('privacy:li51')}</li>
          <li>{t('privacy:li52')}</li>
          <li>{t('privacy:li53')}</li>
          <li>{t('privacy:li54')}</li>
          <li>{t('privacy:li55')}</li>
        </ul>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p31')}</p>
        <ul className=" text-base font-medium mb-5 px-12 list-disc">
          <li>{t('privacy:li56')}</li>
          <li>{t('privacy:li57')}</li>
          <li>{t('privacy:li58')}</li>
          <li>{t('privacy:li59')}</li>
        </ul>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p32')}</p>
        <ul className=" text-base font-medium mb-5 px-12 list-disc">
          <li>{t('privacy:li60')}</li>
          <li>{t('privacy:li61')}</li>
          <li>{t('privacy:li62')}</li>
        </ul>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p33')} <br/> <br/> {t('privacy:p34')}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('privacy:h7')}</h2>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p35')}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('privacy:h8')}</h2>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p36')}<br/> <br/> {t('privacy:p37')}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('privacy:h9')}</h2>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p38')}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('privacy:h10')}</h2>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p39')}<br/> <br/> {t('privacy:p40')}</p>
        <ul className=" text-base font-medium mb-5 px-12 list-disc">
          <li>{t('privacy:li63')}</li>
          <li>{t('privacy:li64')}</li>
          <li>{t('privacy:li65')}</li>
          <li>{t('privacy:li66')}</li>
          <li>{t('privacy:li67')}</li>
          <li>{t('privacy:li68')}</li>
          <li>{t('privacy:li69')}</li>
          <li>{t('privacy:li70')}</li>
        </ul>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p41')}<br/> <br/> {t('privacy:p42')}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('privacy:h11')}</h2>
        <p className=" text-base font-medium mb-5 py-3 px-3">{t('privacy:p43')}<br/> <br/> {t('privacy:p44')}<br/>{t('privacy:p45')}<br/> {t('privacy:p46')}<br/> {t('privacy:p47')}<br/> <br/> {t('privacy:p48')}<br/> <br/> {t('privacy:p49')} </p>
      </div>

      {/* Footer */}
      <FooterSection useState={useState} t={t} Image={Image} hostname={props.hostname}/>

    </main>
  )
}
