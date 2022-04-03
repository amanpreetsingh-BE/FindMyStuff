import { auth } from "@lib/firebase";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
/* Cookie handler */
import cookie from "js-cookie";

export function useUserData() {
  const { user } = useAuthState(auth);
  const [firebaseToken, setFirebaseToken] = useState(null);
  const tokenName = "firebaseToken";
  var in45Minutes = 1 / 32;

  useEffect(async () => {
    if (user) {
      const token = await user.getIdToken();
      cookie.set(tokenName, token, { expires: in45Minutes });
      setFirebaseToken(token);
    } else {
      cookie.remove(tokenName);
    }
  }, [user]);

  return { user, firebaseToken };
}
