/* React imports */
import {useState, useRef} from 'react'
import axios from "axios"

/* Hero icons */
import {LocationMarkerIcon} from '@heroicons/react/outline'
export default function SelectPage({  }) {

  const cp = useRef()

  const handleLoc = async (e) => {
    let xmls = '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"> \
                <soap12:Body> \
                    <WSI4_PointRelais_Recherche xmlns="http://www.mondialrelay.fr/webservice/"> \
                    <Enseigne>BDTEST13</Enseigne> \
                    <Pays>BE</Pays> \
                    <NumPointRelais></NumPointRelais> \
                    <Ville></Ville> \
                    <CP>1050</CP> \
                    <Latitude></Latitude> \
                    <Longitude></Longitude> \
                    <Taille></Taille> \
                    <Poids></Poids> \
                    <Action></Action> \
                    <DelaiEnvoi></DelaiEnvoi> \
                    <RayonRecherche></RayonRecherche> \
                    <TypeActivite></TypeActivite> \
                    <NACE></NACE> \
                    <NombreResultats>30</NombreResultats> \
                    <Security>E49BB520D0A76456DA3F1C27A4193A97</Security> \
                    </WSI4_PointRelais_Recherche> \
                </soap12:Body> \
                </soap12:Envelope> \
                ';
    axios.post("https://api.mondialrelay.com/Web_Services.asmx",
                xmls,
                {headers:
                    {
                        'Content-Type': 'text/xml',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
                    }
                }).then(res=>{
                    console.log(res);
                }).catch(err=>{console.log(err)});
  }

  return (
    <main className="bg-primary text-white min-h-screen px-12 py-12">
        <div className="font-bold text-xl sm:text-2xl">Point relais</div>
        <div>Indiquez votre code postal afin de selectionner l'endroit ou votre objet sera remis</div>
        <div className='mt-12'>
            
            <label htmlFor="cp" className="block text-sm font-medium text-gray-200">Code postal</label>
            <div className="mt-1 flex justify-start">
                <input className='w-32' id="cp" name="cp" type="number" ref={cp} required/>
                <button onClick={handleLoc} className="max-w-xl ml-2 py-2 px-4 font-bold text-md bg-emerald-500 hover:bg-emerald-600 rounded-lg"><LocationMarkerIcon className='w-6 h-6 text-white' /></button>
            </div>

        </div>

    </main>
  )
}