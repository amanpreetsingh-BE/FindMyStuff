/* Next imports */
import Image from 'next/image'

/* Custom components imports */
import NavReduced from '@components/navbar/NavReduced'

/* Translate imports */
import {serverSideTranslations} from 'next-i18next/serverSideTranslations'
import {useTranslation} from 'next-i18next'

/* Handle language */
export async function getStaticProps({ locale }){
  return {
    props: {
      ...(await serverSideTranslations(locale, ['career'])),
      locale
    }
  }
}

export default function Career({ }) {

  /* Handle language */
  const { t } = useTranslation();

  return (
    <main className="bg-primary h-screen w-full">

        <NavReduced darkLogo={false} />
        
        <h1 className="text-white text-md md:text-xl font-bold w-1/2 min-w-[300px] max-w-[640px] border-b-4 border-secondary flex items-end justify-end my-16">{t('career:heading')}</h1>

        <div className="text-white font-extrabold text-md md:text-xl flex flex-col items-center justify-center">  
            <div className="max-w-xs sm:max-w-sm md:max-w-xl text-center">{t('career:desc')}</div>

            <div className="w-1/2 h-full flex justify-center items-center mt-24">
                <Image src={'/images/career/undraw_resume_re_hkth.svg'} width={200} height={186} alt={'graphicsCareer'}/>
            </div>
            
        </div>

    </main>
  )
}