import { auth, firestore } from '../lib/firebase';
import { doc, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
/* Cookie handler */
import cookie from 'js-cookie'

// Custom hook to read auth record and user profile doc
export function useUserData() {
  
  const [user, loading] = useAuthState(auth);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [email, setEmail] = useState(null);
  const [signMethod, setSignMethod] = useState(null);
  /* token name for cookie */
  const tokenName = 'firebaseToken'

  var in45Minutes = 1/32;


  useEffect(async () => {
    // turn off realtime subscription
    let unsubscribe;
    
    if(user){
      const token = await user.getIdToken();
      cookie.set(tokenName, token, {expires : in45Minutes})
      unsubscribe = onSnapshot(doc(firestore, 'users', user.uid), (doc) => {
        setFirstName(doc.data()?.firstName);
        setLastName(doc.data()?.lastName);
        setEmail(doc.data()?.email);
        setSignMethod(doc.data()?.setSignMethod);
      });
    } else {
        cookie.remove(tokenName)
        setFirstName(null);
        setLastName(null);
        setEmail(null);
        setSignMethod(null);
    }

    return unsubscribe;
  }, [user]);

  return { user, loading, firstName, lastName, email, signMethod};
}