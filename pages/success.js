/* Custom components imports */
import NavReduced from "@components/navbar/NavReduced";

/* Icons imports */
import {CheckCircleIcon} from '@heroicons/react/outline'

/* Translate imports */
import {serverSideTranslations} from 'next-i18next/serverSideTranslations'
import {useTranslation} from 'next-i18next'

export async function getServerSideProps({ query, locale }){
    const URL_session_id = query.session_id
    const checkout = await (fetch(`${process.env.HOSTNAME}/api/checkout/${URL_session_id}`))
    const checkoutJSON = await checkout.json()
    
    if(checkoutJSON.id && !(checkoutJSON.payment_status=="unpaid")){
        const order = await (fetch(`${process.env.HOSTNAME}/api/orders/${URL_session_id}`))
        const orderJSON = await order.json()

        if(!orderJSON.emailSent){
            await (fetch('https://us-central1-findmystuff-74e93.cloudfunctions.net/api/checkout/send-email', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderJSON)
            }));
        }

        return {
            props: {
                order_id: JSON.stringify(orderJSON.order_id),
                order_email: JSON.stringify(orderJSON.customer_email),
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

export default function Success(props) {
    /* Handle language */
    const {t} = useTranslation();
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
            </div>
        </main>
    )
}