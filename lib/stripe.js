/* Stripe import */
import {loadStripe} from '@stripe/stripe-js'

let stripePromise = null

const getStripe = () => {
    if(!stripePromise) {
        stripePromise = loadStripe(process.env.next_public_stripe_publishable_key)
    }
    return stripePromise
}

export default getStripe;