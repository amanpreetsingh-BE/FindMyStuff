/* Stripe import */
import { loadStripe } from "@stripe/stripe-js";

let stripePromise = null;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      "pk_live_51IEuWpK5KPA8d9Ovdep6bb9kAs8tHgXTSRqKo21Jh4tPTg9JDx0LIMJzxQxLvCNAmJGguRHM04f2V2WJac159Mbz00SduyZOPP"
    ); // OK it is public to do
  }
  return stripePromise;
};

export default getStripe;
