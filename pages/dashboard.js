/* React imports */
import React, {useContext, useEffect, useState} from 'react'

/* Next imports */
import router from 'next/router'
import Image from 'next/image'
import Link from 'next/link'

/* Firebase components imports */
import {UserContext} from '@lib/context'
import {auth} from '@lib/firebase'
import {sendEmailVerification} from 'firebase/auth' 

/* Custom components imports */
import NavReduced from '@components/navbar/NavReduced'
import AdminLayout from '@components/dashboard/AdminLayout'
import UserLayout from '@components/dashboard/UserLayout'

/* Icons imports */
import {LogoutIcon} from '@heroicons/react/outline'

/* Various animations imports */
import toast from 'react-hot-toast'

/* Translate imports */
import {serverSideTranslations} from 'next-i18next/serverSideTranslations'
import {useTranslation} from 'next-i18next'

/* Handle language */
export async function getServerSideProps({ req, locale, query }) {
    // verify the state of the user if USER or ADMIN or INVALID
    
    const userEmail = query.user
    const firebaseToken = req.cookies.firebaseToken
    const credential = await (fetch(`/api/credential/?userEmail=${userEmail}&token=${firebaseToken}`))
    const credentialJSON = (await credential.json())
    const invalid = credentialJSON.type == "invalid" ? true : false
    const admin = credentialJSON.type == "admin" ? true : false
    /* If query id not valid -> return not found */
    
    if(invalid || !firebaseToken) {
        return {
            notFound: true,
        }
    }

    /* FETCH sensitive data only if ADMIN user */

    // Get products
    const products = admin ? (await (fetch(`/api/products`))) : null
    const productsJSON = admin ? (await products.json()) : null

    // Get orders
    const orders = admin ? (await (fetch(`/api/orders`))) : null
    const ordersJSON = admin ? (await orders.json()) : null

    // Get messages
    const messages = admin ? (await (fetch(`/api/messages`))) : null
    const messagesJSON = admin ? (await messages.json()) : null

    // Get messages
    const stats = admin ? (await (fetch(`/api/statistics`))) : null
    const statsJSON = admin ? (await stats.json()) : null

    return {
        props: {
            ...(await serverSideTranslations(locale, ['dashboard'])),
            locale,
            productsJSON,
            ordersJSON,
            messagesJSON,
            statsJSON,
            admin
        }
    }
}

export default function Dashboard(props) {
    /* Handle language */
    const {t} = useTranslation();
    
    /* Handle user info through hook */
    const { user, loading, firstName, lastName, address, email } = useContext(UserContext)
    const [loaded, setLoaded] = useState(false)

    /* Import image */
    const mailIllustration = require('@images/dashboard/mailConfirm.svg');

    /* Handle verify email */
    const [emailVerified, setEmailVerified] = useState(false)
    const [disabledResend, setDisabledResend] = useState(false)
    const resendEmailActivation = async (e) => {
        e.preventDefault()
        sendEmailVerification(user)
        .then(() => {
            setDisabledResend(true)
            return toast.success(t('dashboard:notVerified:successResend'))
        }).catch((error) => {
            return toast.error(t('dashboard:notVerified:errorResend'))
        });
    }

    /* Protect route */
    useEffect(() => {
        if(user && !loading){
            setLoaded(true)
            setEmailVerified(user.emailVerified)
        }
        if (!user && !loading) {
            router.push('/')
        }
    }, [loading])

    if(loaded && !emailVerified) {
        console.log("VERIFY")
        return (
            <main>
                <NavReduced darkLogo={true} />
                <div className="flex justify-center flex-col items-center w-full h-screen -mt-20">
                    <Image src={mailIllustration} priority alt="mailConfirm" width={264} height={264}/>
                    <div className="max-w-sm sm:max-w-lg text-center text-primary px-12">
                        {t('dashboard:notVerified:verifyEmail')}
                    </div>
                    <div className="text-center text-primary px-12">
                        <button disabled={disabledResend} onClick={resendEmailActivation} className="w-full px-4 py-4 mt-4 font-md text-white text-md bg-indigo-600 hover:bg-indigo-500 rounded-lg">{t('dashboard:notVerified:resendMsgBtn')}</button>
                    </div>
                </div>
            </main>
        )
    } else if (loaded && !props.admin){
        console.log("user logged in")
        return (
            <UserLayout useState={useState} Link={Link} Image={Image} SignOutButton={SignOutButton} firstName={firstName} lastName={lastName} address={address} email={email} t={t} />
        )
    } else if (loaded && props.admin){
        console.log("admin logged in")
        return (
            <AdminLayout useState={useState} Image={Image} Link={Link} toast={toast} SignOutButton={SignOutButton} firstName={firstName} lastName={lastName} address={address} email={email} t={t} productsJSON={props.productsJSON} ordersJSON={props.ordersJSON} messagesJSON={props.messagesJSON} statsJSON={props.statsJSON}/>
        )
    } else {
        console.log("loading")
        return ''
    }
}


// Sign out button 
function SignOutButton(){

    /* Handle language */
    const { t } = useTranslation();

    const signOutAndRedirect = () => {
        auth.signOut()
        router.push('/')
    }
    return <button className="text-sm flex flex-row mt-2 items-center justify-center rounded-lg font-medium hover:text-gray-50 text-white" onClick={signOutAndRedirect}> <LogoutIcon className="w-6 h-6 mr-1"/> {t('dashboard:verified:signout')}</button>
}