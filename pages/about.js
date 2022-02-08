/* Next imports */
import Image from 'next/image'

/* Custom components imports */
import NavReduced from '@components/navbar/NavReduced'

/* Translate imports */
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

/* Handle language */
export async function getStaticProps({ locale }){
  return {
    props: {
      ...(await serverSideTranslations(locale, ['about'])),
      locale
    }
  }
}

export default function About({ }) {

  /* Handle language */
  const {t} = useTranslation();

  return (
    <main className="bg-primary">

        <NavReduced darkLogo={false} />

        <div className="mx-auto relative w-full h-[400px]">
            <div className="flex">
                <Image priority loading='eager' src={'/images/about/wesley-armstrong-awltiXiUjbk-unsplash.jpg'} objectFit="cover" layout='fill' alt={'logo'}/>
            </div>
        </div>

        <h1 className="text-white text-xl md:text-2xl font-bold w-1/2 min-w-[300px] max-w-[640px] border-b-4 border-secondary flex items-end justify-end my-16">{t('about:heading1')}</h1>
        <div className="text-white flex flex-col md:flex-row justify-evenly items-center w-full">
            <div className="w-10/12 md:w-1/2 md:ml-4 md:max-w-lg">
                {t('about:whoarewe')}
            </div>
            <div className="w-1/2 h-full flex justify-center items-center mt-5">
                <a href="https://www.yncubator.be" target="_blank" rel="noreferrer" >
                    <Image src={'/images/about/yncubator.png'} width={200} height={77} alt={'logoYncubator'}/>
                </a>
            </div>
        </div>

        <h1 className="text-white text-xl md:text-2xl font-bold w-1/2 min-w-[300px] max-w-[640px] border-b-4 border-secondary flex items-start justify-start my-16 ml-auto">{t('about:heading2')}</h1>
        <div className="text-white flex flex-col md:flex-row justify-evenly items-center w-full">
            <div className="w-1/2 h-full flex justify-center items-center mb-5">
                <Image src={'/images/about/undraw_completed_tasks_vs6q.svg'} width={200} height={181} alt={'graphicsMission'}/>
            </div>
            <div className="w-10/12 md:mr-4 md:w-1/2 md:max-w-lg">
                {t('about:mission')}
            </div>
        </div>

        <h1 className="text-white text-xl md:text-2xl font-bold w-1/2 min-w-[300px] max-w-[640px] border-b-4 border-secondary flex items-end justify-end my-16">{t('about:heading3')}</h1>
        <div className="flex flex-col justify-center items-center md:flex-row mx-10 text-white pb-32">
            <div className="w-full md:w-1/3 flex flex-col justify-center items-center space-y-4 mb-24">
                <div className="font-bold text-xl">{t('about:amanpreetsingh:name')}</div>
                <div className="w-1/2 h-full flex justify-center items-center ">
                    <Image src={'/images/about/aman.png'} width={180} height={180} alt={'aman'}/>
                </div>
                <div className="font-semibold text-secondary text-lg">{t('about:formation')}</div>
                <div className="font-medium text-gray-300 text-sm ">{t('about:amanpreetsingh:school')}</div>
                <div className="font-medium text-white text-base ">{t('about:amanpreetsingh:study')}</div>

            </div>
            <div className="w-full md:w-1/3  flex flex-col justify-center items-center space-y-4 mb-24">
                <div className="font-bold text-xl">{t('about:federicosonnino:name')}</div>
                <div className="w-1/2 h-full flex justify-center items-center">
                    <Image src={'/images/about/fede.png'} width={180} height={180} alt={'fede'}/>
                </div>
                <div className="font-semibold text-secondary text-lg">{t('about:formation')}</div>
                <div className="font-medium text-gray-300 text-sm ">{t('about:federicosonnino:school')}</div>
                <div className="font-medium text-white text-base ">{t('about:federicosonnino:study')}</div>

            </div>
            <div className="w-full md:w-1/3 flex flex-col justify-center items-center space-y-4 mb-24">
                <div className="font-bold text-xl">{t('about:mohamedchaabani:name')}</div>
                <div className="w-1/2 h-full flex justify-center items-center">
                    <Image src={'/images/about/chab.png'} width={180} height={180} alt={'mohamed'}/>
                </div>
                <div className="font-semibold text-secondary text-lg">{t('about:formation')}</div>
                <div className="font-medium text-gray-300 text-sm ">{t('about:mohamedchaabani:school')}</div>
                <div className="font-medium text-white text-base ">{t('about:mohamedchaabani:study')}</div>
            </div>
        </div>

    </main>
  )
}