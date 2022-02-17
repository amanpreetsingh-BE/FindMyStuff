/* React imports */
import {useState, useRef} from 'react'
/* Translate imports */
import {serverSideTranslations} from 'next-i18next/serverSideTranslations'
import {useTranslation} from 'next-i18next'

/* Built-in Next.js imports */
import Image from 'next/image'
import Link from 'next/link'
import {useRouter} from 'next/router'

import {EyeOffIcon, EyeIcon} from '@heroicons/react/solid'

/* Firebase components imports */
import {auth, firestore} from '@lib/firebase'
import {GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail} from 'firebase/auth'
import {writeBatch, doc, getDoc} from "firebase/firestore"

/* Custom components imports */
import Modal from '@components/misc/Modal'

/* Various animations imports */
import toast from 'react-hot-toast'

/* Handle language */
export async function getServerSideProps({ req, params, locale }) {
    const id = params.id
    const hostname = process.env.HOSTNAME
    const verify = await (fetch(`${hostname}/api/qr/${id}`))
    const verifyJSON = (await verify.json())
    
    console.log(locale)

    if(verifyJSON.verified){
        const activate = verifyJSON.activate

        return {
            props: {
                ...(await serverSideTranslations(locale, ['scan'])),
                locale,
                id,
                activate,
                hostname
            },
        }
    } else {
        return {
            notFound: true
        }
    }
}

export default function ScanPage({id, activate, hostname}) {
  /* Handle language */
  const {t} = useTranslation();
  /* Import images */
  const icon = require('@images/icons/icon_white.svg');

  /* handle signup or sigin state and loaded user */
  const [signupState, setSignupState] = useState(true)

  /* Used to push to dashboard */
  const router = useRouter()

  /* handle form values through ref */
  const [formLoading, setFormLoading] = useState(false) /* is the form processing ? */
  const [isPwdVisible, setIsPwdVisible] = useState(false)
  const formFirstname = useRef()
  const formLastname = useRef()
  const formEmail = useRef()
  const formPassword = useRef()
  const formRepeatPassword = useRef()
  const formForgot = useRef()

  /* Handle Modal for forgot pwd */
  const [showModal, setShowModal] = useState(false)
  function openModal() {
      setShowModal(prev => !prev);
  }

  const handleRegister = async (id, email) => {

    const data = {
        id: id,
        email: email,
    }
    console.log(data)
    
    const response = await (fetch(`${hostname}/api/qr/register`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) 
    }));
    const responseJSON = await (response.json())
    if(responseJSON.success){
        return toast.success("Success")
    } else {
        return toast.success(responseJSON.err)
    }
  }

  const onSubmit = async (e) => {
    if(signupState){
      e.preventDefault()
  
      /* Handle firstname and lastname regex */
      const re = /^[a-zA-Z]*$/

      setFormLoading(true)

      if((!re.test(formFirstname.current.value)) || (!re.test(formLastname.current.value))){ // number and special characters test
        setFormLoading(false)
        return toast.error(t('scan:errorName:specialC'))
      } else if (((formFirstname.current.value).length > 26) || ((formLastname.current.value).length > 26)){
        setFormLoading(false)
        return toast.error(t('scan:errorName:tooMuchC'))
      } else if (((formFirstname.current.value).length < 3) || ((formLastname.current.value).length < 3)){
        setFormLoading(false)
        return toast.error(t('scan:errorName:tooLowC'))
      } else if (formPassword.current.value !== formRepeatPassword.current.value){
        setFormLoading(false)
        return toast.error(t('scan:errorPwd:notsame'))
      } else if (((formPassword.current.value).length < 6) || ((formRepeatPassword.current.value).length < 6)){
        setFormLoading(false)
        return toast.error(t('scan:errorPwd:atleast6'))
      } else {
        createUserWithEmailAndPassword(auth, formEmail.current.value, formPassword.current.value).then(
          (userCredential) => {
            const userDoc = doc(firestore, "users", `${userCredential.user.uid}`);
            const batch = writeBatch(firestore);
            batch.set(userDoc, { email: formEmail.current.value, firstName: formFirstname.current.value, lastName: formLastname.current.value, signMethod: "email", admin: false });

            batch.commit().then(() => {
              sendEmailVerification(auth.currentUser)
              .then(() => {
                handleRegister(id, auth.currentUser.email)
                router.push('/scan/select/')
              });
            }).catch((error) => {
              console.error(error);
            });
          }
        ).catch(
          function(err){
            console.log(err.code)
            if(err.code === "auth/invalid-email"){
              setFormLoading(false)
              return toast.error(t('scan:emailBadlyFormatted'))
            }
            else if(err.code === "auth/email-already-in-use"){
              setFormLoading(false)
              return toast.error(t('scan:accountAlreadyExist'))
            }
            else if(err.code === "auth/weak-password"){
              setFormLoading(false)
              return toast.error(t('scan:errorPwd:atleast6'))
            }
            else{
              setFormLoading(false)
              return toast.error(t('scan:errorMakingAccount'))
            }
          }
        )
      }
      
      setFormLoading(false)
    } else {
      e.preventDefault()
  
      setFormLoading(true)

      signInWithEmailAndPassword(auth, formEmail.current.value, formPassword.current.value).then(
        (userCredential)=>{
            handleRegister(id, formEmail.current.value)
            router.push('/scan/select/')
        }
      ).catch(
        function(err){
          setFormLoading(false)
          return toast.error(err.message)
        }
      )
      setFormLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    sendPasswordResetEmail(auth, formForgot.current.value)
    .then(() => {
      setShowModal(false)
      toast.success(t('scan:forgot:emailSendSuccess')) 
    })
    .catch((error) => {
      const errorMessage = error.code;
      if(errorMessage=="auth/user-not-found"){
        setShowModal(false)
        return toast.error(t('scan:forgot:emailSendUser'))
      } else if(errorMessage=="auth/missing-email"){
        setShowModal(false)
        return toast.error(t('scan:forgot:emailSendEmpty'))
      } else if(errorMessage=="auth/invalid-email"){
        setShowModal(false)
        return toast.error(t('scan:forgot:emailSendInvalid'))
      } else{
        setShowModal(false)
        return toast.error(t('scan:forgot:errorEmailSend'))
      }
    });
  }

  if(activate){
    return (
        <main>
            Activated
        </main>
      )
  } else {
    return (
      <>
        <main className="w-full py-12 flex flex-col space-y-8 justify-center items-center bg-primary min-h-screen">

              <Link passHref href="/">
                <div className="flex justify-center">
                    <div className="cursor-pointer relative w-[64px] h-[64px] sm:w-[90px] sm:h-[90px]">
                        <Image src={icon} priority layout="fill" alt="logoReduceds" />
                    </div>
                </div>
              </Link>

              <div className="">
                <div className="text-gray-300 text-center font-extrabold text-xl sm:text-2xl max-w-sm">
                    {t('scan:welcome')}
                </div>
                <div className="text-gray-200 text-center text-xs sm:text-base flex justify-center items-center w-full mt-1">
                  {signupState ? t('scan:account'):t('scan:noAccount') } <span className="cursor-pointer ml-1 text-gray-200 hover:text-white font-bold" onClick={()=>setSignupState(!signupState)}>{signupState ? t('scan:signinBtn') : t('scan:signupBtn')}</span>
                </div>
              </div>


            <div className="mx-auto w-full max-w-xs sm:max-w-lg">
              <div className="bg-white py-8 px-8 mb-8 shadow rounded-xl sm:px-10 text-gray-800">
                <form className="mb-0 space-y-4" onSubmit={onSubmit}>
                  {signupState ? 
                    <>
                    <div>
                      <label htmlFor="textFirstname" className="block text-sm font-medium text-gray-700">{t('scan:field:firstname')}</label>
                      <div className="mt-1 ">
                        <input id="textFirstname" name="textFirstname" type="text" ref={formFirstname} required/>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="textLastname" className="block text-sm font-medium text-gray-700">{t('scan:field:lastname')}</label>
                      <div className="mt-1 ">
                        <input id="textLastname" name="textLastname" type="text" ref={formLastname} required/>
                      </div>
                    </div>
                    </> : ''
                  }
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('scan:field:email')}</label>
                    <div className="mt-1">
                      <input id="email" name="email" type="email" autoComplete="email" ref={formEmail} required/>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('scan:field:password')}</label>
                    <div className="relative mt-1">
                      {isPwdVisible ? <EyeIcon onClick={()=>setIsPwdVisible(false)} className='absolute cursor-pointer text-gray-600 top-3 right-3 w-5 h-5'/> 
                      : <EyeOffIcon onClick={()=>setIsPwdVisible(true)} className='absolute cursor-pointer text-gray-600 top-3 right-3 w-5 h-5'/>}
                      <input id="password" name="password" type={isPwdVisible ? "text":"password"} autoComplete="password" ref={formPassword} required/>
                    </div>
                  </div>

                  
                  {signupState ? 
                  <>
                  <div>
                    <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-700">{t('scan:field:repeatPassword')}</label>
                    <div className="mt-1">
                      <input id="repeatPassword" name="repeatPassword" type="password" ref={formRepeatPassword} required/>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input id="terms-and-privacy" name="terms-and-privacy" required type="checkbox" />
                    <label htmlFor="terms-and-privacy" className="ml-2 block text-sm text-gray-900">
                      <span> {t('scan:agree')} </span>
                      <a href="terms" target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-500">{t('scan:terms')}</a>
                      <span> {t('scan:and')} </span> 
                      <a href="privacy" target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-500">{t('scan:privacy')}</a>
                    </label>
                  </div>

                  <div className="flex justify-center w-full">
                      <button disabled={formLoading} className="w-full py-4 font-md text-white text-md bg-gray-700 hover:bg-gray-800 rounded-lg">{t('scan:signupButtonTxt')}</button>
                  </div>
                  </>
                  : 
                  <>
                    <div className="flex justify-end text-sm font-bold">
                      <div onClick={openModal} className="cursor-pointer text-gray-500 hover:text-primary">
                        {t('scan:forgotPassword')}
                      </div>
                      <Modal showModal={showModal} setShowModal={setShowModal}>
                        <div className="flex justify-start px-10 py-24 items-center leading-3 flex-col text-primary">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="text-lg sm:text-lg md:text-xl font-extrabold text-gray-800 text-center">{t('scan:forgot:heading')}</div>
                            <div className="text-xs sm:text-md text-gray-700 max-w-sm text-center leading-4">{t('scan:forgot:desc')}</div>
                            <input id="emailForgot" name="emailForgot" type="email" ref={formForgot}/>
                            <button onClick={resetPassword} className="w-full py-4 font-md text-white text-md bg-gray-700 hover:bg-gray-800 rounded-lg">{t('scan:forgot:rstButtonText')}</button>
                          </div>

                        </div>
                      </Modal> 
                    </div>

                    <div className="flex justify-center">
                      <button disabled={formLoading} className="w-full py-4 font-md text-white text-md bg-gray-700 hover:bg-gray-800 rounded-lg">{t('scan:signinButtonTxt')}</button>
                    </div>

                    <div className="w-full text-center border-b-[1px] border-gray-400 leading-[5px]"><span className="bg-white py-2 px-2">{t('scan:or')}</span></div>    
                    
                    <div className="flex flex-col">
                      <SignInGoogleButton id={id} />

                      <SignInFacebookButton id={id} />
                    </div>
                  </>}

                </form>
              </div>
            </div>
        </main>

        </>
      )
  }
}



// Sign in with Google button
function SignInGoogleButton(id) {

    const { t } = useTranslation();
    const router = useRouter()
  
    async function manageGoogleUserData(userDoc, userCredential){
      const batch = writeBatch(firestore);
      const last = userCredential.user.displayName.split(" ").length == 1 ? "" : userCredential.user.displayName.split(" ")[1]
      const docSnap = (await getDoc(userDoc))
      if(docSnap.exists()){
        console.log(docSnap.exists())
        console.log('UPDATE')
        batch.update(userDoc, { email: userCredential.user.email, firstName: userCredential.user.displayName.split(" ")[0], lastName: last });
      } else {
        console.log(docSnap.exists())
        console.log('SET')
        batch.set(userDoc, { email: userCredential.user.email, firstName: userCredential.user.displayName.split(" ")[0], lastName: last, signMethod: "google", admin: false });
      }
      batch.commit().then(() => {
        console.log("Batch operation successful");
      }).catch((error) => {
        console.error(error);
      });
    }
  
    const signInWithGoogle = async () => {
      const googleProvider = new GoogleAuthProvider()
      googleProvider.setCustomParameters({
        prompt: "select_account"
      });
      await signInWithPopup(auth, googleProvider)
      .then((userCredential) => {
        const userDoc = doc(firestore, "users", `${userCredential.user.uid}`);
        manageGoogleUserData(userDoc, userCredential)
        handleRegister(id, userCredential.user.email)
        router.push('/scan/select/')
        //router.push(`/dashboard/?user=${userCredential.user.email}`)
      }).catch((error) => {
        const errorMessage = error.message;
        //return toast.error(errorMessage)
        return toast.error(t('scan:errorSignGoogle'))
      });
    };
  
    return (
      <button className="bg-transparent border-2 border-gray-50 shadow-md hover:bg-gray-50 text-gray-700 w-full py-4 flex items-center justify-center no-underline font-md rounded cursor-pointer mx-auto my-2" onClick={signInWithGoogle}>
        <Image src={'/images/icons/google.png'} alt={'logoGoogle'} width={20} height={20}/> <span className="ml-2">{t('scan:signInWithGoogle')}</span>
      </button>
    );
  }
  
  // Sign in with Facebook button
  function SignInFacebookButton(id) {
  
    const { t } = useTranslation();
    const router = useRouter()
  
    async function manageFacebookUserData(userDoc, userCredential){
      const batch = writeBatch(firestore);
      const last = userCredential.user.displayName.split(" ").length == 1 ? "" : userCredential.user.displayName.split(" ")[1]
      const docSnap = (await getDoc(userDoc))
      if(docSnap.exists()){
        console.log(docSnap.exists())
        console.log('UPDATE')
        batch.update(userDoc, { email: userCredential.user.email, firstName: userCredential.user.displayName.split(" ")[0], lastName: last });
      } else {
        console.log(docSnap.exists())
        console.log('SET')
        batch.set(userDoc, { email: userCredential.user.email, firstName: userCredential.user.displayName.split(" ")[0], lastName: last, signMethod: "facebook", admin: false });
      }
      batch.commit().then(() => {
        console.log("Batch operation successful");
      }).catch((error) => {
        console.error(error);
      });
    }
  
    const signInWithFacebook = async () => {
      const facebookProvider = new FacebookAuthProvider()
      facebookProvider.setCustomParameters({
        prompt: "select_account"
      });
      await signInWithPopup(auth, facebookProvider)
      .then((userCredential) => {
        const userDoc = doc(firestore, "users", `${userCredential.user.uid}`);
        manageFacebookUserData(userDoc, userCredential)
        handleRegister(id, userCredential.user.email)
        router.push('/scan/select/')
      }).catch((error) => {
        const errorMessage = error.message;
        console.log(errorMessage)
        return toast.error(t('scan:errorSignFb'))
      });
    };
  
    return (
      <button className="bg-facebook shadow-md hover:bg-facebookHover border-none text-white w-full py-4 flex items-center justify-center no-underline font-md rounded cursor-pointer mx-auto my-2" onClick={signInWithFacebook}>
        <Image src={'/images/icons/f_logo_RGB-White_512.png'} alt={'logoFacebook'} width={20} height={20}/> <span className="ml-2">{t('scan:signInWithFacebook')}</span>
      </button>
    );
  }
  