/* React imports */
import {useState, useEffect, useRef} from 'react'
/* Translate imports */
import {serverSideTranslations} from 'next-i18next/serverSideTranslations'
import {useTranslation} from 'next-i18next'
/* Built-in Next.js imports */
import Image from 'next/image'
import Link from 'next/link'
import {useRouter} from 'next/router'

import {EyeOffIcon, EyeIcon} from '@heroicons/react/solid'

import Map from '@components/Map';
import { Document, Page, pdfjs } from 'react-pdf';

import zipJSON from '@root/public/misc/zipcode-belgium.json'
import {LocationMarkerIcon} from '@heroicons/react/outline'

/* Firebase components imports */
import {auth, firestore} from '@lib/firebase'
import {GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail} from 'firebase/auth'
import {writeBatch, doc, getDoc, Timestamp} from "firebase/firestore"

/* Custom components imports */
import Modal from '@components/misc/Modal'

/* Various animations imports */
import toast from 'react-hot-toast'
import { ArrowCircleLeftIcon } from '@heroicons/react/outline'

/* Handle language */
export async function getServerSideProps({ req, params, locale }) {
    const id = params.id
    const hostname = process.env.HOSTNAME
    const verify = await (fetch(`${hostname}/api/qr/${id}`))
    const verifyJSON = (await verify.json())

    if(verifyJSON.verified){
        const activate = verifyJSON.activate
        const email = verifyJSON.email
        const jetons = verifyJSON.jetons
        const timestamp = verifyJSON.timestamp
        const pdf = verifyJSON.pdf

        const data = {
          id: id,
          email: email
        }
        if(activate){
          await (fetch(`${hostname}/api/qr/notifications/notify`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) 
          }));
        }
        return {
            props: {
                ...(await serverSideTranslations(locale, ['scan'])),
                locale,
                id,
                activate,
                email,
                jetons,
                timestamp,
                pdf,
                hostname
            },
        }
    } else {
        return {
            notFound: true
        }
    }
}

export default function ScanPage({id, activate, email, timestamp, pdf, hostname, locale, jetons}) {
  
  /* Handle language */
  const {t} = useTranslation();

  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

  /* Import images */
  const icon = require('@images/icons/icon_white.svg');
  const en_flag = require('@images/icons/gb.svg')
  const fr_flag = require('@images/icons/fr.svg')
  const animatedFound = require('@images/scan/animatedFounNoLoopBlue.gif')
  const [step, setStep] = useState(0)

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

  const [show, setShow] = useState(true);
  const [checked, setChecked] = useState(true);
  const fullName = useRef()
  const iban = useRef()
  const delay = 2;
  useEffect(
    () => {
      let timer1 = setTimeout(() => setShow(false), delay * 1000);
      return () => {
        clearTimeout(timer1);
      };
    },
    []
  );

  const cp = useRef()
  const [center, setCenter] = useState([50.850340, 4.351710])
  const [listPt, setListPt] = useState(null)
  const [selected, setSelected] = useState(false)
  const [selection, setSelection] = useState("")


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
        return toast.success(t('scan:successQRregister'))
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
                router.push(`/scan/select/?id=${id}&user=${auth.currentUser.email}`)
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
            router.push(`/scan/select/?id=${id}&user=${formEmail.current.value}`)
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

  const handleGenerateQR = async (e) => {
    e.preventDefault()
    if(!checked && (fullName.current.value == "" || iban.current.value == "")){
      return toast.error("Merci de rentrer votre IBAN et votre nom complet")
    } else {
      const exp = 2505600
      let data = null

      if(timestamp && Timestamp.now().seconds < timestamp+exp){
        /* CASE 1 : Already generated before, and not expired */
        data = {
          fullName: checked ? "":fullName.current.value ,
          iban: checked ? "":iban.current.value,
          id: id,
          expire: false,
          timestamp: timestamp,
          donation: checked
        }

      } else if (timestamp && Timestamp.now().seconds >= timestamp+exp){
        /* CASE 2 : Already generated before, and expired */
        data = {
          fullName: checked ? "":fullName.current.value,
          iban: checked ? "":iban.current.value ,
          id: id,
          expire: true,
          timestamp: timestamp,
          donation: checked
        }

      } else {
        /* CASE 3 : never generated before */
        data = {
          fullName: checked ? "":fullName.current.value,
          iban: checked ? "":iban.current.value,
          id: id,
          expire: null,
          timestamp: timestamp,
          donation: checked
        }
      }
      await (fetch(`${hostname}/api/qr/notifications/notifyGenerate`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) 
      }));
      
      setStep(2)
    }
  }

  function generateMarker(Marker, Popup){
    var result = []
    var iter = 0
    listPt.forEach(element => {
        var heading = element.LgAdr1[0]
        var code = element.CP[0]
        var street = element.LgAdr3[0]
        var urlPhoto = element.URL_Photo[0]
        var Num = element.Num[0]

        result.push(
            <Marker 
                key={iter}
                position={[element.Latitude[0].replace(/,/g,'.'), element.Longitude[0].replace(/,/g,'.')]}
                eventHandlers={{
                    click: (e) => {
                        setSelection({
                            heading: heading,
                            street: street,
                            code: code,
                            urlPhoto: urlPhoto,
                            num: Num
                        })
                    },
                }}>
                <Popup>
                    <div className='text-lg font-bold'>{heading}</div>
                    <div className='text-sm font-md'>Address : {street}</div>
                    <div className='text-sm font-md mb-6'>Code postal : {code}</div>
                    <div className='flex justify-center items-center'><Image src={urlPhoto} width={200} height={200} /></div>
                </Popup>
            </Marker>
        )
        iter = iter + 1
    });
    return result
  }

  const handleLoc = async (e) => {
    e.preventDefault()
    try{
        const data = {
            cp: cp.current.value
        }
        const response = await (fetch(`${hostname}/api/qr/findPointByCP/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }));
        const responseJSON = await (response.json())
        setListPt(responseJSON["soap:Envelope"]["soap:Body"][0]["WSI4_PointRelais_RechercheResponse"][0]["WSI4_PointRelais_RechercheResult"][0].PointsRelais[0].PointRelais_Details)
        setCenter([zipJSON.filter(({zip}) => zip === cp.current.value)[0].lat,zipJSON.filter(({zip}) => zip === cp.current.value)[0].lng])
        setSelected(true)
    } catch(err){
        return toast.error(err.message)
    }
  }

  function LanguageBox(id, locale, fr_flag, en_flag){
    const flag = (locale === "en" ? en_flag : fr_flag)
    return (
      <nav className="flex -mt-12 justify-end items-center top-0 w-full h-20">
          <div className="group inline-block relative">
              <button
              className="bg-transparent text-gray-700 font-semibold py-3 px-4 rounded inline-flex items-center"
              >
              
                  <span className="mr-2 pt-1">
                      <Image src={flag} priority quality="100" width={30} height={22} alt="flag"/>
                  </span>

                  <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                  >
                      <path
                      d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                      />
                  </svg>
              </button>
              <ul className="absolute hidden text-gray-700 pt-1 group-hover:block">
                  <li className="">
                      <a href={`/en/scan/${id}`}
                      className="rounded-t cursor-pointer bg-transparent hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
                      ><Image src={en_flag} priority quality="100" width={30} height={22} alt="flag"/></a>
                  </li>
                  <li className="">
                    <a href={`/fr/scan/${id}`}
                      className="bg-transparent cursor-pointer hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
                      ><Image src={fr_flag} priority quality="100" width={30} height={22} alt="flag"/></a>
                  </li>
              </ul>
          </div>
      </nav>
    )
  }

  if (jetons < 1) {
    return (
      <main className="w-full flex flex-col justify-center items-center text-white bg-primary h-screen">
        <div className='absolute top-16 right-4'>{LanguageBox(id, locale, fr_flag, en_flag)}</div>
        <div className='flex items-center justify-center flex-col'>
          <div className='border-secondary mx-8 border-2 py-12 px-8 text-lg max-w-sm text-center rounded-lg'>
            {t('scan:noJetons')}
          </div>
        </div>
      </main>
    )
  } else if(activate) {
    return(
      <main className="w-full flex flex-col justify-center items-center text-white bg-primary h-screen">
        <div className='absolute top-16 right-4'>{LanguageBox(id, locale, fr_flag, en_flag)}</div>
        {step == 0 ?
          <div className='flex items-center justify-center flex-col'>
            {show ? <Image src={animatedFound} width={300} height={300} /> : 
            <>
              <div className='border-gray-500 border-2 space-y-4 py-12 px-4 max-w-sm mx-12 text-center rounded-lg'>
                <p>L'objet attaché au code QR que vous avez scannez est perdu.</p>
                <p className='text-sm font-extrabold'>Et vous venez juste de le retrouver</p> 
              </div>
              <div className='text-center mx-12 mt-4 text-gray-300'>
                En plus d'accomplir une <b>bonne action</b>, vous êtes <b>recompenser</b> pour la faire, souhaitez-vous en apprendre plus ?
              </div>
              <button onClick={()=>setStep(1)} className="max-w-lg py-3 px-8 mx-auto my-4 font-bold text-md border-2 border-emerald-500 hover:border-emerald-600 rounded-lg">YES</button>
            </>}
          </div> : step == 1 ? 
            <div className='flex items-center justify-center flex-col'>
              <div className='border-gray-500 border-2 space-y-4 py-1 px-8 max-w-sm mx-4 mt-12 text-center rounded-lg'>
                <ul className='list-disc text-left space-y-2'>
                  <li>En cliquant sur le bouton "GENERER", un code QR sera crée dans un délai d'au maximum 15 minutes</li>
                  <li>Il suffit ensuite de présenter ce code QR au gérant du point relais avec l'objet perdu et celui-ci se charge du reste. Pensez à emballer l'objet perdu</li>
                  <li>Sur la page suivant, une liste de points relais se situant aux alentours de votre localisation (code postal) est affiché</li>
                </ul>
              </div>
              <div className='text-center mx-12 mt-4 text-gray-300'>
                  <div className="flex items-center text-left">
                      <input id="how" name="how" type="checkbox" checked={checked} onChange={()=>setChecked(!checked)} />
                      <label htmlFor="how" className="ml-4 block text-sm max-w-xs text-white-300">
                        En réalisant ces étapes, vous serez récompensez d'un montant de 3e.
                        Je souhaite que ce montant soit versé à l'association des petits riens
                      </label>
                  </div>
                  {checked ? "" : 
                    <div>
                      <div className='mt-1'>
                        <label htmlFor="textFullname" className="block text-sm font-medium text-left text-gray-300">Fullname</label>
                        <div className="mt-1 ">
                          <input id="textFullname" name="textFullname" type="text" ref={fullName} required/>
                        </div>
                      </div>
                      <div className='mt-1'>
                        <label htmlFor="iban" className="block text-sm font-medium text-left text-gray-300">IBAN</label>
                        <div className="mt-1 ">
                          <input id="iban" name="iban" type="text" ref={iban} required/>
                        </div>
                      </div>
                      
                    </div>
                  }
              </div>
              <button onClick={handleGenerateQR} className="max-w-lg py-3 px-8 mx-auto my-4 font-bold text-md border-2 border-emerald-500 hover:border-emerald-600 rounded-lg cursor-pointer">GENERER</button>
              <div className='flex justify-end'><ArrowCircleLeftIcon onClick={()=>setStep(0)} className='text-white cursor-pointer w-6 h-6'/></div>

          </div> : step == 2 ? 
          <div className='flex -mt-24 items-center justify-start flex-col'>
                  <div className='w-[98%]'>
            
                    <label htmlFor="cp" className="block-inline text-sm font-medium text-gray-200">ZIP code</label>
                    <form className="mt-1 flex justify-start" onSubmit={handleLoc}>
                        <input className='w-32' id="cp" name="cp" type="number" ref={cp} required/>
                        <button className="max-w-xl ml-2 py-2 px-4 font-bold text-md bg-emerald-500 hover:bg-emerald-600 rounded-lg"><LocationMarkerIcon className='w-6 h-6 text-white inline' /></button>
                    </form>
                    {selected ? <div className={"w-full h-80 mt-4 "}>
                         <Map className="w-full  h-full" center={center} zoom={13}>
                            {({ TileLayer, Marker, Popup }) => (
                                <>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                                />
                                {generateMarker(Marker, Popup)}
                                </>
                            )}
                        </Map> 
                    </div>: ''}

                </div>
                {pdf ?
                  <>
                    <div className='text-center max-w-xs px-4 my-4'>Please present this QR code to the nearest pickup point !</div>
                    <div style={{ position:"absolute", top:selected ? "70%":"60%", clip: "rect(25px,130px,147px,9px)"}}>
                        <Document className={""} file={`${pdf}`}>
                            <Page height={200} wrap={false} pageNumber={1}/>
                        </Document>
                    </div>
                  </>
                 : 
                 <>
                  <div className='text-center max-w-xs my-4'> Le code QR apparaîtra au maximum dans 15 minutes</div>
                  <svg role="status" className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-300 fill-emerald-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                </>}
          </div>
              : ""}

      </main>
    )
  } else if (email && !activate) {
    return(
      <main className="w-full flex flex-col justify-center items-center text-white bg-primary h-screen">
        <div className='absolute top-16 right-4'>{LanguageBox(id, locale, fr_flag, en_flag)}</div>
        <div className='flex items-center justify-center flex-col'>
          <div className='border-secondary border-2 mx-8 py-12 px-8 text-lg max-w-sm text-center rounded-lg'>
            {t('scan:chooseRelais')}
          </div>
        </div>
      </main>
    )
  } else {
    return (
      <>
        <main className="w-full pt-12 flex flex-col justify-center items-center bg-primary min-h-screen">
              {LanguageBox(id, locale, fr_flag, en_flag)}
              <div className="space-y-8 pb-8">
                <Link passHref href="/">
                  <div className="flex justify-center">
                      <div className="cursor-pointer relative w-[58px] h-[58px] sm:w-[80px] sm:h-[80px]">
                          <Image src={icon} priority layout="fill" alt="logoReduceds" />
                      </div>
                  </div>
                </Link>

                <div className="">
                  <div className="text-gray-300 text-center font-extrabold text-xl sm:text-2xl max-w-xs">
                      {t('scan:welcome')}
                  </div>
                  <div className="text-gray-200 text-center text-xs sm:text-base flex justify-center items-center w-full mt-1">
                    {signupState ? t('scan:account'):t('scan:noAccount') } <span className="cursor-pointer ml-1 text-gray-200 hover:text-white font-bold" onClick={()=>setSignupState(!signupState)}>{signupState ? t('scan:signinBtn') : t('scan:signupBtn')}</span>
                  </div>
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
        router.push(`/scan/select/?id=${id}&user=${userCredential.user.email}`)
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
        router.push(`/scan/select/?id=${id}&user=${userCredential.user.email}`)
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
