/* React imports */
import {useState, useContext, useRef} from 'react'
import { UserContext } from '@lib/context'
/* Built-in Next.js imports */
import Image from 'next/image'
import {useRouter} from 'next/router'
/* Hero icons */
import {LocationMarkerIcon} from '@heroicons/react/outline'

/* Translate imports */
import {serverSideTranslations} from 'next-i18next/serverSideTranslations'
import {useTranslation} from 'next-i18next'
import toast from 'react-hot-toast'

import Map from '@components/Map';

import zipJSON from '@root/public/misc/zipcode-belgium.json'


/* Handle language */
export async function getServerSideProps({ query, req, res, locale }) {
    const hostname = process.env.HOSTNAME
    const id = query.id
    const email = query.user
    const firebaseToken = req.cookies.firebaseToken

    // is connected and email in query
    if(firebaseToken && email){
        const credential = await (fetch(`/api/credential?userEmail=${email}&token=${firebaseToken}&authorization=${process.env.NEXT_PUBLIC_API_KEY}`))
        const credentialJSON = (await credential.json())
        const invalid = credentialJSON.type == "invalid" ? true : false
        // is connected and email and query by the good user
        if(invalid){
            return {
                notFound: true
            }
        } else{
            const data = {
                id: id,
                authorization: process.env.NEXT_PUBLIC_API_KEY
            }
            const verify = await (fetch(`/api/qr/verify`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) 
            }));
            const verifyJSON = (await verify.json())

            const activate = verifyJSON.activate
            const emailQR = verifyJSON.email

            // the id of qr is valid
            if(verifyJSON.verified){
                // pas encore select mais register ou select et register
                if((!activate && emailQR==email) || (activate && emailQR==email)){
                    return {
                        props: {
                            ...(await serverSideTranslations(locale, ['scan'])),
                            locale,
                            id,
                            emailQR,
                            activate,
                            hostname
                        },
                    }
                } else if(!activate && emailQR==""){
                        return {
                            notFound: true
                        }
                } else {
                    return {
                        notFound: true
                    }
                }
            } else {
                return {
                    notFound: true
                }
            }
        }
    } else {
        return {
            notFound: true
        }
    }
    /* NOT CLEAN AT ALL but to be updated in V2 */
}

export default function SelectPage({ id, emailQR, hostname, locale }) {
    /* Handle language */
  const {t} = useTranslation();

  const en_flag = require('@images/icons/gb.svg')
  const fr_flag = require('@images/icons/fr.svg')
  /* Used to push to dashboard */
  const router = useRouter()
  const { email } = useContext(UserContext)

  const cp = useRef()
  const [center, setCenter] = useState([50.850340, 4.351710])
  const [listPt, setListPt] = useState(null)
  const [selected, setSelected] = useState(false)
  const [selection, setSelection] = useState("")

  function LanguageBox(locale, fr_flag, en_flag){
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
                    <a href={`/en/scan/select?id=${id}&user=${emailQR}`}
                      className="rounded-t cursor-pointer bg-transparent hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
                      ><Image src={en_flag} priority quality="100" width={30} height={22} alt="flag"/></a>
                  </li>
                  <li className="">
                    <a href={`/fr/scan/select?id=${id}&user=${emailQR}`}
                      className="bg-transparent cursor-pointer hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
                      ><Image src={fr_flag} priority quality="100" width={30} height={22} alt="flag"/></a>
                  </li>
              </ul>
          </div>
      </nav>
    )
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
                    <div className='text-sm font-md'>{t('scan:select:popupStreet')} {street}</div>
                    <div className='text-sm font-md mb-6'>{t('scan:select:popupCode')} {code}</div>
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
            cp: cp.current.value,
            authorization: process.env.NEXT_PUBLIC_API_KEY
        }
        const response = await (fetch(`/api/qr/findPointByCP/`, {
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
        return toast.error(t('scan:select:errLoc'))
    }
  }

  const handleRegister = async (e) => {
      e.preventDefault()

      if(selection == ""){
        return toast.error("Merci de selectionner un point relais !")
      } else {
            try{
                const data = {
                    id: id,
                    selection: selection,
                    authorization: process.env.NEXT_PUBLIC_API_KEY
                }
                const response = await (fetch(`/api/qr/relais`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }));
                const responseJSON = await (response.json())
                if(responseJSON.success){
                    toast.success(t('scan:select:success'))
                    router.push(`${hostname}/dashboard/?user=${email}`)
                } else{
                    toast.error(t('scan:select:err'))
                }
            } catch(err){
                return toast.error(t('scan:select:err'))
            }
      }
  }

  return (
    <main className="bg-primary text-white min-h-screen px-8 py-12">
        <div className='mb-12'>
            {LanguageBox(locale, fr_flag, en_flag)}    
        </div>
        
        <div className="font-bold text-xl sm:text-2xl -mt-8">{t('scan:select:heading')}</div>
        <div>{t('scan:select:desc')}</div>
        <div className='mt-8'>
            
            <label htmlFor="cp" className="block-inline text-sm font-medium text-gray-200">{t('scan:select:code')}</label>
            <form className="mt-1 flex justify-start" onSubmit={handleLoc}>
                <input className='w-32' id="cp" name="cp" type="number" ref={cp} required/>
                <button className="max-w-xl ml-2 py-2 px-4 font-bold text-md bg-emerald-500 hover:bg-emerald-600 rounded-lg"><LocationMarkerIcon className='w-6 h-6 text-white' /></button>
            </form>
            <div className={"w-full max-w-xl h-96 mt-12"}>
                {selected ? <Map className="w-full h-full" center={center} zoom={13}>
                    {({ TileLayer, Marker, Popup }) => (
                        <>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                        />
                        {generateMarker(Marker, Popup)}
                        </>
                    )}
                </Map> : ''}
            </div>
            {selected ? 
                    <div className='flex justify-center items-center'>
                        <button className='max-w-xl py-4 mt-12 px-4 font-bold text-md bg-emerald-500 hover:bg-emerald-600 rounded-lg' onClick={handleRegister}>{t('scan:select:saveBtn')}</button>
                    </div>
                    : ''
            }

        </div>

    </main>
  )
}