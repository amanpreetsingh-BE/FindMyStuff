/* Custom components imports */
import NavReduced from "@components/navbar/NavReduced";
import {useRouter} from 'next/router'

/* Icons imports */
import {CheckCircleIcon} from '@heroicons/react/outline'

/* Translate imports */
import {serverSideTranslations} from 'next-i18next/serverSideTranslations'
import {useTranslation} from 'next-i18next'

export async function getServerSideProps({ query, locale }){

    const URL_session_id = query.session_id
    const checkout = await (fetch(`${process.env.HOSTNAME}/api/checkout/${URL_session_id}`))
    const checkoutJSON = await checkout.json()
    if(checkoutJSON.id && (checkoutJSON.payment_status=="paid")){
        const reload = await (fetch(`${process.env.HOSTNAME}/api/reloads/${URL_session_id}`))
        const reloadJSON = await reload.json()
        const authorization = process.env.NEXT_PUBLIC_API_KEY

        if(!reloadJSON.emailSent) {
            /* Send confirmation to the client */
            await (fetch(`${process.env.HOSTNAME}/api/mailer/send-reloadReceipt`, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({reloadJSON: reloadJSON, authorization: authorization})
            }));
        }

        return {
            props: {
                order_id: JSON.stringify(reloadJSON.order_id),
                order_email: JSON.stringify(reloadJSON.customer_email),
                ...(await serverSideTranslations(locale, ['payment'])),
                locale
            }
        }
    } else {
        return {
            notFound: true,
        }
    }
}

export default function Reloaded(props) {
    /* Handle language */
    const {t} = useTranslation();
    /* Used to push to dashboard */
    const router = useRouter()
    const order_id = JSON.parse(props.order_id)
    const customer_email = JSON.parse(props.order_email)
    return (
        <main>
            <NavReduced darkLogo={true} />
            <div className="w-4/5 mt-12 max-w-2xl mx-auto flex flex-col items-center space-y-2">
                <CheckCircleIcon className="w-10 text-secondaryHover h-10 sm:w-12 sm:h-12"/>
                <h1 className="text-xl text-center tracking-wide font-['Roboto'] sm:text-2xl">{t('payment:heading')}</h1>
                <p className="text-xs sm:text-sm text-center">{t('payment:desc')}</p>
                <p className="text-xs sm:text-sm text-gray-600 text-center">{order_id}</p>
                <p className="text-xs sm:text-sm text-center max-w-xs">{t('payment:sub_desc')}</p>
                <p className="text-xs sm:text-sm text-gray-600 text-center">{customer_email}</p>
                <button onClick={()=>router.push("/")} className='bg-secondary cursor-pointer hover:bg-secondaryHover text-white font-bold rounded-lg px-12 py-4'>{t('payment:goHome')}</button>

            </div>
        </main>
    )
}