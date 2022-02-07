import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
    apiKey: "AIzaSyCNLJVNebCmOHH1A2A7r97QThf7I1YadLM",
    authDomain: "findmystuff-35626.firebaseapp.com",
    projectId: "findmystuff-35626",
    storageBucket: "findmystuff-35626.appspot.com",
    messagingSenderId: "428358669359",
    appId: "1:428358669359:web:7ccaf99cd0b7d4c1afa2da",
    measurementId: "G-2YDBX9XXP5"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
