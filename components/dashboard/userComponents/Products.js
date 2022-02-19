import {useRouter} from 'next/router'
/* Hero icons */
import {LocationMarkerIcon} from '@heroicons/react/outline'
import {ArrowCircleLeftIcon} from '@heroicons/react/outline'
import {CashIcon} from '@heroicons/react/outline'
export default function Products({ useState, useRef, Modal, t, toast, Image, email, userProductsJSON }) {
  /* Used to push to dashboard */
  const router = useRouter()

  const [showModal, setShowModal] = useState(false)
  const [modalID, setModalID] = useState('')
  const [modalRelaisCP, setModalRelaisCP] = useState('')
  const [modalRelaisStreet, setModalRelaisStreet] = useState('')
  const [modalRelaisPhoto, setModalRelaisPhoto] = useState('')
  const [modalJetons, setModalJetons] = useState('')
  const [modalRelaisHeading, setModalRelaisHeading] = useState('')
  const [rd, setRd] = useState(false)
  const [rj, setRj] = useState(false)

  const couponsClass = "grid place-items-center gap-8 grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto px-12 py-16"
  const emptyCouponsClass = "flex justify-center items-center max-w-7xl mx-auto px-8 py-16"

  function openModal(){
    setShowModal(prev => !prev);
  }

  const renderProducts = (products) => {
    const cards = []

    function openStockModal(id, relaisHeading, relaisCP, relaisStreet, relaisPhoto, jetons){
        setModalID(id)
        setModalRelaisHeading(relaisHeading) 
        setModalRelaisCP(relaisCP) 
        setModalRelaisStreet(relaisStreet) 
        setModalRelaisPhoto(relaisPhoto) 
        setModalJetons(jetons) 
        if(!relaisHeading && !relaisCP && !relaisStreet && !relaisPhoto){
            router.push(`/scan/select?id=${id}&user=${email}`)
        } else {
            openModal()
        }
    }

    products.forEach(product => {
        const id = product.id
        const jetons = product.data.jetons
        const relaisHeading = product.data.relais == null ? null : product.data.relais.heading
        const relaisCP = product.data.relais == null ? null : product.data.relais.code
        const relaisStreet = product.data.relais == null ? null : product.data.relais.street
        const relaisPhoto = product.data.relais == null ? null : product.data.relais.urlPhoto
        cards.push(
            <div key={id} onClick={()=>openStockModal(id, relaisHeading, relaisCP, relaisStreet, relaisPhoto, jetons)} className="flex flex-col justify-center items-center w-80 h-80 rounded-lg bg-[#1B212E] shadow-lg hover:shadow-lg cursor-pointer">
                <div className="text-lg font-bold ">{id}</div>
                {jetons >= 1 ? 
                  <div className='text-emerald-500 font-bold text-sm'>Livraisons restantes : {jetons}</div> :
                  <div className=' text-red-400 font-bold text-sm'>Livraisons restantes : {jetons}</div>
                }
                
            </div>
        )
    });
    return cards
  }

  function renderDelivery() {
      return(
          <>
            <div className='mt-4 border-2 rounded-lg px-4 pt-4 mx-4 '>
                <div className='flex justify-center items-center space-x-8 sm:space-x-10 lg:space-x-12'>
                    <div className=''>
                        <h1 className='text-xl font-mono'>{modalRelaisHeading}</h1>
                        <p className='text-sm'>{modalRelaisStreet+', '+modalRelaisCP}</p>
                    </div>
                    <div className=''><Image src={modalRelaisPhoto} width={140} height={140} /></div>
                </div>
                <button onClick={handleChangeRelais} className="max-w-lg py-4 px-8 mx-auto my-4 font-bold text-md bg-emerald-500 hover:bg-emerald-600 rounded-lg flex"><LocationMarkerIcon className='w-6 h-6 text-white' /> <span className='text-white ml-2'>Modifier</span></button>
            </div>

            <div className='flex justify-center my-auto items-center cursor-pointer' onClick={()=>setRd(false)} >
                <ArrowCircleLeftIcon className='text-gray-800 w-6 h-6'/> <span>Go back</span> 
            </div>
          </>
      )
  }

  function renderJetons () {
    return(
        <>
          <div className='w-3/4 mt-1 text-xs text-center'>
            Le nombre de jetons est le nombre de livraisons, si il n'y a plus de jetons, il faut recharger 3.5e pour que la livraison puisse se faire en cas d'objet retrouvé.
          </div>
          <div className='mt-4 border-2 rounded-lg px-4 mx-4'>
                <div className='flex justify-center items-center space-x-12'>
                    <h1 className='text-md py-4 text-center font-mono'>Nombre de jetons actuel : {modalJetons} </h1>
                </div>
                {modalJetons >= 1 ? "":<button onClick={handleReload} className="max-w-xl py-4 px-8 mx-auto my-4 font-bold text-md bg-emerald-500 hover:bg-emerald-600 rounded-lg flex"><CashIcon className='w-6 h-6 text-white' /> <span className='text-white ml-2'>Recharger</span></button>}
          </div>
          <div className='flex justify-center mt-4 items-center cursor-pointer' onClick={()=>setRj(false)} >
                <ArrowCircleLeftIcon className='text-gray-800 w-6 h-6'/> <span>Go back</span> 
          </div>
        </>
    )
  }

  const handleChangeRelais = async (e) => {
    router.push(`/scan/select?id=${modalID}&user=${email}`)
  }

  const handleReload = async (e) => {
    console.log('reload')
  }

  return (
    <div className="mt-20 mx-12 lg:mx-auto px-12 py-12 max-w-4xl ">
        <div className="flex font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
            My products
        </div>

        <div className={userProductsJSON.length > 0 ? couponsClass : emptyCouponsClass}>
          {userProductsJSON.length > 0 ? renderProducts(userProductsJSON) : <div>No Items</div>}
          <div className='absolute'>
              <Modal showModal={showModal} setShowModal={setShowModal}>
                  <div className='w-full h-full flex flex-col justify-start items-center'>
                      <h1 className='text-2xl font-mono pt-12'>Manage my QR</h1>
                      {rd ? renderDelivery() : rj ? renderJetons() : <div className='mt-12 grid place-items-center gap-4 grid-cols-2'>
                        <div onClick={()=>setRd(true)} className='bg-indigo-500 cursor-pointer w-28 h-28 px-4 py-4 sm:w-40 sm:h-40 sm:px-12 sm:py-12 rounded-lg text-center flex justify-center items-center text-white font-bold'>Lieu de livraison</div>
                        <div onClick={()=>setRj(true)} className='bg-emerald-500 cursor-pointer w-28 h-28 px-4 py-4 sm:w-40 sm:h-40 sm:px-12 sm:py-12 rounded-lg text-center flex justify-center items-center text-white font-bold'>Jetons</div>
                      </div>}
                  </div>
              </Modal>
          </div>
        </div>

    </div>
  )
}