/* React imports */
import {useRef} from 'react'

/* Custom components imports */
import Modal from '@components/misc/Modal'
import Products from './userComponents/Products'
import Notifications from './userComponents/Notifications'
import Parameters from './userComponents/Parameters'

/* Hero icon to illustrate go back */
import {ArrowCircleLeftIcon} from '@heroicons/react/outline'

/* Import motion for animation */
import {motion} from 'framer-motion'

/* Swiper imports */
import {Swiper, SwiperSlide} from 'swiper/react';
import SwiperCore , {Pagination} from 'swiper/core';
import 'swiper/swiper.min.css';
import 'swiper/components/pagination/pagination.min.css';
import 'swiper/components/navigation/navigation.min.css';
SwiperCore.use([Pagination]);

/* variants states for animation menu open or closed, make it as global */
const variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "-100%" },
}

function UserLayout({useState, toast, Link, Image, SignOutButton, firstName, lastName, email, uid, user, hostname, t, userProductsJSON, userNotificationsJSON }) {


    const [showModal, setShowModal] = useState(true)
    function openModal(){
        setShowModal(prev => !prev);
    }

    /* States for managing open and close of menu */
    const [isMenu, setIsMenu] = useState(true)
    const [triggerComponent, setTriggerComponent] = useState(false)
    const [renderOption, setRenderOption] = useState('')
    const classMainSection = triggerComponent ? 'min-h-screen':'grid place-items-center max-w-7xl mx-auto px-8 py-16 min-h-screen'
    const gridVisibility = !triggerComponent ? ' ' : " hidden "
    const closeMenu = (option) => {
        setIsMenu(false)
        switch (option) {
            case 'prod':
                setRenderOption('prod')
                break;
            case 'notif':
                setRenderOption('notif')
                break;
            case 'param':
                setRenderOption('param')
                break;
            default:
                setRenderOption("Ooops .. something went wrong :(")
                break;
        }
        setTimeout(function() {
            setTriggerComponent(true)
          }, 500);
    }
    const openMenu = () => {
        setIsMenu(true)
        setTriggerComponent(false)
    }

    return(
        <main className='bg-[#171C26] font-nxt text-white'>
            {/* Nav */}
            <nav className="z-20 flex top-0 h-20">
                <div className="flex justify-between items-center pl-10 pr-10 h-full w-full ">
                    <Link passHref href="/" >
                        <div className="pt-3 flex h-full justify-center items-center">
                                <div className="hidden cursor-pointer relative sm:flex sm:w-[200px] sm:h-[40px]">
                                    <Image src={'/images/icons/logo_white.svg'} priority layout="fill" alt="home" />
                                </div>
                        </div>
                    </Link>
                    <div className='flex items-center justify-center'>
                        <Image src={'/images/icons/undraw_profile_pic_ic-5-t.svg'} width={32} height={32} alt="profilePic" />
                        <div className='ml-2 font-bold'>
                            {firstName} { } {lastName} 
                        </div>
                    </div>
                </div>
            </nav>

            {/* Menu */}
            <section className={classMainSection}>
                {triggerComponent ? 
                    <div> 
                        {renderOption == "prod" ? <Products useState={useState} useRef={useRef} Modal={Modal} t={t} toast={toast} Image={Image} email={email} userProductsJSON={userProductsJSON} /> : 
                         renderOption == "notif" ? <Notifications useState={useState} useRef={useRef} Modal={Modal} t={t} toast={toast} userNotificationsJSON={userNotificationsJSON} hostname={hostname} motion={motion} email={email} /> : 
                         renderOption == "param" ? <Parameters useState={useState} email={email} firstName={firstName} lastName={lastName} uid={uid} user={user} hostname={hostname} useRef={useRef} Modal={Modal} t={t} toast={toast} /> : 
                         "oops .. Something went wrong"}
                    </div>
                    : ""
                }

                <motion.div transition={{ duration: 1 }} animate={isMenu ? "open" : "closed"} variants={variants} className={'grid bg-[#1B212E] p-8 sm:p-20 gap-4 grid-cols-2 sm:grid-cols-3' + gridVisibility}>

                    <motion.div transition={{ duration: 1 }} onClick={()=>closeMenu("prod")} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#64cd83] text-lg sm:text-xl text-center font-bold cursor-pointer flex justify-center items-center shadow-xl hover:shadow-xl h-44 rounded-2xl col-span-1 sm:col-span-2 '>
                        <h2 className='mx-4'>{t('dashboard:user:prod')}</h2>
                    </motion.div>
                    <motion.div transition={{ duration: 1 }} onClick={()=>closeMenu("notif")} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#64cd83] text-lg sm:text-xl text-center font-bold cursor-pointer flex justify-center items-center shadow-xl h-44 rounded-2xl'>
                        <h2 className='mx-4'>{t('dashboard:user:notif')}</h2>
                    </motion.div>

                    <motion.div transition={{ duration: 1 }} onClick={()=>closeMenu("param")} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#64cd83] relative text-lg sm:text-xl text-center font-bold cursor-pointer flex justify-center items-center shadow-xl h-44 rounded-2xl col-span-2 sm:col-span-3'>
                        <h2 className='mx-4'>{t('dashboard:user:param')}</h2>
                    </motion.div>
                    <motion.div transition={{ duration: 1 }} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#C64177] text-lg sm:text-xl text-center font-bold cursor-pointer flex justify-center items-center shadow-lg hover:shadow-xl h-44 rounded-2xl col-span-2 sm:col-span-3 '>
                        <SignOutButton />
                    </motion.div>

                </motion.div>

                {user ? (user.metadata.createdAt == user.metadata.lastLoginAt) ? 
                <div className='absolute'>
                    <Modal showModal={showModal} setShowModal={setShowModal}>
                        <Swiper slidesPerView={1} pagination={{bulletClass: 'swiper-pagination-bullet', clickable: 'true'}} className='h-full w-full font-nxt '>
                            <SwiperSlide>
                                <div className='flex h-full justify-center items-center flex-col'>
                                    <h1 className='text-lg sm:text-xl font-mono font-bold text-emerald-600'>Bienvenue sur le dashboard</h1>
                                    <div className="mx-12 text-center">
                                        <p className='mb-2 mt-1 text-gray-800'>Le dashboard permet de gérer ton compte</p>
                                        <ul className='list-disc border-2 rounded-lg px-8 py-2 text-left text-gray-800'>
                                            <li>Modifier l'addresse de livraison ou recharger tes produits</li>
                                            <li>Voir les notifications</li>
                                            <li>Changer ton mot de passe ou même supprimer ton compte</li>
                                        </ul>     
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className='flex h-full justify-center items-center flex-col'>
                                    <h1 className='text-lg sm:text-xl font-mono font-bold text-emerald-600'>Comment cela fonctionne ?</h1>
                                    <div className="mx-12 text-center">
                                        <p className='mb-2 mt-1 text-gray-800'>Etape 1</p>
                                        <p className='mb-2 border-2 rounded-lg px-2 py-2 mt-1 text-gray-800'>J'achète un porte-clef ou sticker sur le site auquel je le rattache à un objet que je souhaite ne pas perdre. Il faut ensuite enregistrer le produit en le scannant avec un smartphone.</p>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className='flex h-full justify-center items-center flex-col'>
                                    <h1 className='text-lg sm:text-xl font-mono font-bold text-emerald-600'>Comment cela fonctionne ?</h1>
                                    <div className="mx-12 text-center">
                                        <p className='mb-2 mt-1 text-gray-800'>Etape 2</p>
                                        <p className='mb-2 border-2 rounded-lg px-2 py-2 mt-1 text-gray-800'>Si je perds mon objet et qu'une personne scan le code QR auquel est rattaché mon object perdu, il sera renvoyé vers le site.</p>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className='flex h-full justify-center items-center flex-col'>
                                    <h1 className='text-lg sm:text-xl font-mono font-bold text-emerald-600'>Comment cela fonctionne ?</h1>
                                    <div className="mx-12 text-center">
                                        <p className='mb-2 mt-1 text-gray-800'>Etape 3</p>
                                        <p className='mb-2 border-2 rounded-lg px-2 py-2 mt-1 text-gray-800'>Une liste de points relais sont indiqués à la personne souhaitant le remettre. Cette objet sera ensuite envoyé directement dans votre point relais défini lors de l'enregistrement. La première livraison est offerte.</p>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className='flex h-full justify-center items-center flex-col'>
                                    <h1 className='text-lg sm:text-xl font-mono font-bold text-emerald-600'>Bienvenue Stuffer !</h1>
                                    <div className="mx-12 text-center">
                                        <p className='mb-2 mt-1 text-gray-800'>Le concept est génial, non ?</p>
                                        <p className='mb-2 border-2 rounded-lg px-2 py-2 mt-1 text-gray-800'>Si toi aussi tu trouves ca cool, n'hésite pas à acheter ou enregistrer ton premier stuff !</p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    </Modal>
                </div> : "" : ""}
            </section>

            {!triggerComponent ? "":<div onClick={()=>openMenu()} className='absolute cursor-pointer top-0 right-12 mt-28 flex justify-center items-center'>
                <ArrowCircleLeftIcon className='w-8 h-8 ml-2' />
            </div>}

        </main>
    )
}
export default UserLayout