/* React imports */
import React from 'react'

/* Custom components imports */
import NavReduced from '@components/navbar/NavReduced'

/* Translate imports */
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

/* Handle language */
export async function getStaticProps({ locale }){
  return {
    props: {
      ...(await serverSideTranslations(locale, ['terms'])),
      locale
    }
  }
}

export default function Terms(props) {

  /* Handle language */
  const {t} = useTranslation();

  return (
    <main className="bg-primary font-nxt">
      <NavReduced darkLogo={false} />
      <h1 className="text-white text-xl sm:text-2xl font-bold w-1/2 min-w-[300px] max-w-[640px] border-b-4 border-secondary flex items-end justify-end my-10">{t('terms:Heading1')}</h1>
      <div className="flex flex-col mx-10">
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cgvIntro1')} <br/> <br/> {t('terms:cgvIntro2')} <br/> <br/> {t('terms:cgvIntro3')} <br/> <br/> {t('terms:cgvIntro4')} 
          <br/> <br/> {t('terms:cgvIntro5')} <br/> <br/> {t('terms:cgvIntro6')} <br/> <br/> {t('terms:cgvIntro7')} 
          <br/> {t('terms:cgvIntro8')} <br/> {t('terms:cgvIntro9')} <br/> {t('terms:cgvIntro10')} 
        </p>        
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH1')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP1')}</p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH2')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP2')}</p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH3')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cgvP3')} <br/> <br/> {t('terms:cgvP4')} <br/> <br/> {t('terms:cgvP5')} <br/> <br/> {t('terms:cgvP6')} 
          <br/> <br/> {t('terms:cgvP7')} <br/> <br/> {t('terms:cgvP8')}
        </p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH4')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP9')}</p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH5')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cgvP10')} <br/> <br/> {t('terms:cgvP11')} <br/> <br/> {t('terms:cgvP12')} <br/> <br/> {t('terms:cgvP13')} 
          <br/> <br/> {t('terms:cgvP14')}
        </p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH6')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cgvP18')} <br/> <br/> {t('terms:cgvP19')} <br/> <br/> {t('terms:cgvP20')} 
        </p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH7')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cgvP15')} <br/> <br/> {t('terms:cgvP16')} <br/> <br/> {t('terms:cgvP17')} 
        </p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH8')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP21')}</p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH9')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP22')} <br/> <br/> {t('terms:cgvP23')} </p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH10')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP24')}</p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH11')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP25')}</p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH12')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP26')}</p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH13')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP27')}</p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH14')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cgvP28')} <br/> <br/> {t('terms:cgvP29')} <br/> <br/> {t('terms:cgvP30')} 
        </p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH15')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP31')}</p>
        <ul className="text-white text-base font-md mb-5 px-12 list-disc">
          <li>{t('terms:cgvLi1')}</li>
          <li>{t('terms:cgvLi2')}</li>
          <li>{t('terms:cgvLi3')}</li>
        </ul>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH16')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP32')}</p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH17')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP33')}</p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH18')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP34')}</p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH19')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP35')}</p>
        <ul className="text-white text-base font-md mb-5 px-12 list-disc">
          <li>{t('terms:cgvLi4')}</li>
          <li>{t('terms:cgvLi5')}</li>
          <li>{t('terms:cgvLi6')}</li>
          <li>{t('terms:cgvLi7')}</li>
          <li>{t('terms:cgvLi8')}</li>
          <li>{t('terms:cgvLi9')}</li>
          <li>{t('terms:cgvLi10')}</li>
          <li>{t('terms:cgvLi11')}</li>
        </ul>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH20')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cgvP36')} <br/> <br/> {t('terms:cgvP37')}</p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cgvH21')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cgvP38')} <br/> <br/> {t('terms:cgvP39')} <br/> <br/> {t('terms:cgvP40')} <br/> <br/> {t('terms:cgvP41')} <br/> <br/> {t('terms:cgvP42')}
        </p>
        <ul className="text-white text-base font-md mb-5 px-12 list-decimal">
          <li>
            {t('terms:cgvLi12')}
            <ul className="text-white text-base font-md mb-5 px-12 list-disc">
              <li>
                {t('terms:cgvLii12')}
              </li>
              <li>
                {t('terms:cgvLiii12')}
              </li>
            </ul>
          </li>
          <li>{t('terms:cgvLi13')}</li>
        </ul>

        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cgvP43')} <br/> <br/> {t('terms:cgvP44')}
        </p>
      </div>

      <h1 className="text-white text-xl sm:text-2xl font-bold w-1/2 min-w-[300px] max-w-[640px] border-b-4 border-secondary flex items-end justify-end my-10">{t('terms:Heading2')}</h1>
      
      <div className="flex flex-col mx-10">
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cguP1')} <br/> <br/> {t('terms:cguP2')} <br/> <br/> {t('terms:cguP3')} <br/> <br/> {t('terms:cguP4')} 
          <br/> <br/> {t('terms:cguP5')}
        </p>    
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cguH1')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cguP6')}</p>  
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cguH2')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cguP7')} <br/> <br/> {t('terms:cguP8')} <br/> <br/> {t('terms:cguP9')} <br/> <br/> {t('terms:cguP10')} 
          <br/> <br/> {t('terms:cguP11')} <br/> <br/> {t('terms:cguP12')} <br/> <br/> {t('terms:cguP13')} <br/> <br/> {t('terms:cguP14')}
          <br/> <br/> {t('terms:cguP15')}
        </p> 
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cguH3')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cguP16')}</p>  

        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cguH4')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cguP17')} <br/> <br/> {t('terms:cguP18')} <br/> <br/> {t('terms:cguP19')} <br/> <br/> {t('terms:cguP20')} 
          <br/> <br/> {t('terms:cguP21')}
        </p> 
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cguH5')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cguP22')} <br/> <br/> {t('terms:cguP23')} <br/> <br/> {t('terms:cguP24')} <br/> <br/> {t('terms:cguP25')} 
          <br/> <br/> {t('terms:cguP26')}
        </p> 
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cguH6')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cguP27')}</p>  
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cguH7')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cguP28')} <br/> <br/> {t('terms:cguP29')} <br/> <br/> {t('terms:cguP30')}
        </p>
        <ul className="text-white text-base font-md mb-5 px-12 list-decimal">
          <li>{t('terms:cguLi1')}</li>
          <li>{t('terms:cguLi2')}</li>
          <li>{t('terms:cguLi3')}</li>
          <li>{t('terms:cguLi4')}</li>
        </ul>
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cguP31')} <br/> <br/> {t('terms:cguP32')}
        </p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cguH8')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">{t('terms:cguP33')}</p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cguH9')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cguP34')} <br/> <br/> {t('terms:cguP35')} <br/> <br/> {t('terms:cguP36')}
        </p>
        <h2 className="text-white bg-indigo-400 rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">{t('terms:cguH10')}</h2>
        <p className="text-white text-base font-md mb-5 py-3 px-3">
          {t('terms:cguP37')} <br/> <br/> {t('terms:cguP38')}
        </p>
      </div>
    </main>
  )
}
