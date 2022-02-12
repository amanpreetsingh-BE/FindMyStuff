/* React imports */
import {useRef} from 'react'

/* Custom components imports */
import Modal from '@components/misc/Modal'
import AddProducts from './adminComponents/AddProducts'
import ManageProducts from './adminComponents/ManageProducts'
import ManageOrders from './adminComponents/ManageOrders'
import ManageMessages from './adminComponents/ManageMessages'
import Promo from './adminComponents/Promo'
import Newsletter from './adminComponents/Newsletter'
import NewAdmin from './adminComponents/NewAdmin'
import StatsOrders from './adminComponents/StatsOrders'
import StatsUsers from './adminComponents/StatsUsers'

/* Hero icon to illustrate go back */
import {ArrowCircleLeftIcon} from '@heroicons/react/outline'

/* Import motion for animation */
import {motion} from 'framer-motion'


/* variants states for animation menu open or closed, make it as global */
const variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "-100%" },
}

function AdminLayout({useState, Link, Image, toast, SignOutButton, firstName, lastName, address, email, t, hostname, productsJSON, ordersJSON, messagesJSON, statsJSON, couponsJSON }) {
    /* States for managing open and close of menu */
    const [isMenu, setIsMenu] = useState(true)
    const [triggerComponent, setTriggerComponent] = useState(false)
    const [renderOption, setRenderOption] = useState('')
    const classMainSection = triggerComponent ? 'min-h-screen':'grid place-items-center max-w-7xl mx-auto px-8 py-16'
    const gridVisibility = !triggerComponent ? ' ' : " hidden "
    const closeMenu = (option) => {
        setIsMenu(false)
        switch (option) {
            case 'products':
                setRenderOption('products')
                break;
            case 'addProducts':
                setRenderOption('addProducts')
                break;
            case 'orders':
                setRenderOption('orders')
                break;
            case 'messages':
                setRenderOption('messages')
                break;
            case 'promo':
                setRenderOption('promo')
                break;
            case 'newsletter':
                setRenderOption('newsletter')
                break;
            case 'newAdmin':
                setRenderOption('newAdmin')
                break;
            case 'statsUsers':
                setRenderOption('statsUsers')
                break;
            case 'statsOrders':
                setRenderOption('statsOrders')
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


    const computeNewOrders = () => {
        var i = 0
        ordersJSON.forEach(order => {
            if(!order.shipped){
                i+=1
            }
        });
        return i
    }

    const computeNewMessages = () => {
        var i = 0
        messagesJSON.forEach(msg => {
            if(!msg.replied){
                i+=1
            }
        });
        return i
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
                        {renderOption == "products" ? <ManageProducts useState={useState} useRef={useRef} Image={Image} motion={motion} Modal={Modal} productsJSON={productsJSON} toast={toast} t={t} /> : 
                         renderOption == "addProducts" ? <AddProducts useRef={useRef} useState={useState} hostname={hostname} Image={Image} toast={toast} /> : 
                         renderOption == "orders" ? <ManageOrders useState={useState} Modal={Modal} ordersJSON={ordersJSON} t={t} toast={toast} /> : 
                         renderOption == "messages" ? <ManageMessages useState={useState} hostname={hostname} useRef={useRef} Modal={Modal} messagesJSON={messagesJSON} t={t} toast={toast} /> : 
                         renderOption == "promo" ? <Promo useState={useState} useRef={useRef} Modal={Modal} hostname={hostname} toast={toast} couponsJSON={couponsJSON} /> : 
                         renderOption == "newsletter" ? <Newsletter /> : 
                         renderOption == "newAdmin" ? <NewAdmin useRef={useRef} hostname={hostname} toast={toast}  /> : 
                         renderOption == "statsUsers" ? <StatsUsers /> : 
                         renderOption == "statsOrders" ? <StatsOrders /> : 
                         "oops .. Something went wrong"}
                    </div>
                    : ""
                }

                <motion.div transition={{ duration: 1 }} animate={isMenu ? "open" : "closed"} variants={variants} className={'grid bg-[#1B212E] p-8 sm:p-20 gap-4 grid-cols-2 sm:grid-cols-3' + gridVisibility}>
                    <motion.h1 transition={{ duration: 1 }} animate={isMenu ? "open" : "closed"} variants={variants} className='tracking-wide text-xl sm:text-2xl sm:gap-4 flex justify-center items-center font-extrabold text-center '>{t('dashboard:admin:manage')}</motion.h1>

                    <motion.div transition={{ duration: 1 }} onClick={()=>closeMenu("products")} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#64cd83] text-lg sm:text-xl text-center font-bold cursor-pointer flex justify-center items-center shadow-xl hover:shadow-xl h-44 rounded-2xl col-span-1 sm:col-span-2 '>
                        <h2 className='mx-4'>{t('dashboard:admin:mProducts')}</h2>
                    </motion.div>
                    <motion.div transition={{ duration: 1 }} onClick={()=>closeMenu("addProducts")} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#64cd83] text-lg sm:text-xl text-center font-bold cursor-pointer flex justify-center items-center shadow-xl h-44 rounded-2xl'>
                        <h2 className='mx-4'>{t('dashboard:admin:addProducts')}</h2>
                    </motion.div>
                    <motion.div transition={{ duration: 1 }} onClick={()=>closeMenu("orders")} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#64cd83] relative text-lg sm:text-xl text-center font-bold cursor-pointer flex justify-center items-center shadow-xl h-44 rounded-2xl'>
                        <h2 className='mx-4'>{t('dashboard:admin:mOrders')}</h2>
                        <div className={"absolute top-2 right-2 " + (computeNewOrders() >0 ? "text-red-400" : "text-white")}>{computeNewOrders()}</div>
                    </motion.div>

                    <motion.div transition={{ duration: 1 }} onClick={()=>closeMenu("messages")} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#64cd83] relative text-lg sm:text-xl text-center font-bold cursor-pointer flex justify-center items-center shadow-xl h-44 rounded-2xl'>
                        <h2 className='mx-4'>{t('dashboard:admin:messsagesClient')}</h2>
                        <div className={"absolute top-2 right-2 " + (computeNewMessages() >0 ? "text-red-400" : "text-white")}>{computeNewMessages()}</div>
                    </motion.div>

                    <motion.div transition={{ duration: 1 }} onClick={()=>closeMenu("promo")} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#64cd83] relative text-lg sm:text-xl text-center font-bold cursor-pointer flex justify-center items-center shadow-xl h-44 rounded-2xl'>
                        <h2 className='mx-4'>{t('dashboard:admin:promo')}</h2>
                    </motion.div>

                    <motion.div transition={{ duration: 1 }} onClick={()=>closeMenu("newsletter")} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#64cd83] relative text-lg sm:text-xl text-center font-bold cursor-pointer flex justify-center items-center shadow-xl h-44 rounded-2xl'>
                        <h2 className='mx-4'>{t('dashboard:admin:newsletter')}</h2>
                    </motion.div>

                    <motion.div transition={{ duration: 1 }} onClick={()=>closeMenu("newAdmin")} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#64cd83] text-lg sm:text-xl text-center font-bold cursor-pointer flex justify-center items-center shadow-xl h-44 rounded-2xl '>
                        <h2 className='mx-4 '>{t('dashboard:admin:newAdmin')}</h2>
                    </motion.div>


                    <motion.h1 transition={{ duration: 1 }} animate={isMenu ? "open" : "closed"} variants={variants} className='tracking-wide text-xl sm:text-2xl sm:gap-4 flex justify-center items-center font-extrabold text-center col-span-2 my-4 sm:col-span-1 '>{t('dashboard:admin:stats')}</motion.h1>
                    <motion.div transition={{ duration: 1 }} onClick={()=>closeMenu("statsUsers")} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#DBB457] text-lg sm:text-xl text-center font-bold cursor-pointer flex flex-col justify-center items-center shadow-xl hover:shadow-xl h-44 rounded-2xl'>
                        <h2 className='mx-4'>{t('dashboard:admin:users')} :</h2>
                        <h3 className='mx-4'>{statsJSON.usersNum}</h3>
                    </motion.div>

                    <motion.div transition={{ duration: 1 }} onClick={()=>closeMenu("statsOrders")} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#DBB457] text-lg sm:text-xl text-center font-bold cursor-pointer flex flex-col justify-center items-center shadow-xl h-44 rounded-2xl col-span-1 sm:col-span-1'>
                        <h2 className='mx-4'>{t('dashboard:admin:orders')} :</h2>
                        <h3 className='mx-4'>{statsJSON.ordersNum}</h3> 
                    </motion.div>

                    <motion.div transition={{ duration: 1 }} animate={isMenu ? "open" : "closed"} variants={variants} whileHover={{scale:1.05, transition:{duration:0.1}}} className='bg-[#C64177] text-lg sm:text-xl text-center font-bold cursor-pointer flex justify-center items-center shadow-lg hover:shadow-xl h-44 rounded-2xl col-span-2 sm:col-span-3 '>
                        <SignOutButton />
                    </motion.div>

                </motion.div>
            </section>

            {!triggerComponent ? "":<div onClick={()=>openMenu()} className='absolute cursor-pointer top-0 right-12 mt-28 flex justify-center items-center'>
                <ArrowCircleLeftIcon className='w-8 h-8 ml-2' />
            </div>}

        </main>
    )
}
export default AdminLayout
