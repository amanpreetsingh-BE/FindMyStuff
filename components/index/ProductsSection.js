/* Icons imports */
import {ArrowCircleLeftIcon} from '@heroicons/react/outline'
import {CheckCircleIcon, TruckIcon} from '@heroicons/react/solid'

/* Fetching imports and Stripe lib*/
import axios from 'axios'
import getStripe from '@lib/stripe'

function ProductsSection({ motion, hostname, toast, Image, useState, t, productsJSON, locale }) {
    /* Handle products */
    const [selectedModel, setSelectedModel] = useState([null, null])
    const [configurationStep, setConfigurationStep] = useState(1)

    const next = (keychain, color) => {
      setSelectedModel([keychain, color])
      setConfigurationStep(2)
    }

    const redirectToCheckout = async (e,cat, product) => {
      e.preventDefault()
      try{
        const {
          data: {id}
        } = await axios.post(`${hostname}/api/checkout`, {
          cat: cat,
          priceID: cat== "Keychain" ? selectedModel[1].priceID : product.data.priceID,
          model: cat== "Keychain" ? "Square keychain" : product.id, // to be changed in V2 to selectedModel[0].model
          color: cat== "Keychain" ? selectedModel[1].color : product.data.color,
          locale: locale
        })
        const stripe = await getStripe()
        const res = await stripe.redirectToCheckout({sessionId: id})
        
        if(res.error){
          toast.error(t('home:stripe:error')) 
        } 
      } catch(err){
          toast.error(t('home:stripe:error')) 
      }

    }
    const renderKeychains = () => {
      let sw = []
      const keychains = ((productsJSON[0])[0]).colors // if multiple keychains -> productsJSON[0]
      keychains.forEach((keychain) => {
        sw.push(
            <div key={keychain.priceID} className='h-full flex items-center justify-center w-full'>
              <motion.div whileHover={{ scale: 1.1 }}  whileTap={{ scale: 0.9 }}>
                <div onClick={()=>next(keychain, keychain)} className="cursor-pointer relative w-52 h-52 sm:w-60 sm:h-60 md:w-72 md:h-72 mt-14 mb-16 ">
                    <Image src={keychain.imageURL} layout="fill" alt=""/>
                </div> 
              </motion.div>
            </div>
        )
      })
      return sw
    }

    function renderKeychainCat(){
      if(configurationStep==1){
        return (
          <section id="products">
            <div className='mt-10 text-gray-800 text-center mb-16 font-bold text-2xl sm:text-3xl md:text-4xl'>{t('home:prod:configurator:h1')}</div>
              <div className='w-full mt-32 mb-52'>
                {productsJSON ? <div className='grid place-items-center grid-cols-1 lg:grid-cols-2'>
                  {renderKeychains()} 
                </div>:<div className='text-center text-sm'>Oops something is wrong .. Please try again by refreshing !</div>}
             </div> 
          </section>
        )
      } else {
        return (
          <section id="products">
            <div className='mt-10 text-gray-800 text-center mb-16 font-bold text-2xl sm:text-3xl md:text-4xl'>
              <span>{t('home:prod:configurator:h3')}</span>
              <ArrowCircleLeftIcon onClick={()=>setConfigurationStep(configurationStep-1)} className="text-gray-800 cursor-pointer inline-block absolute right-12 w-8 h-8 sm:w-9 sm:h-9"/>
            </div>
            
  
              <div className='w-full mb-52'>
                <div className='h-full flex flex-col sm:flex-row items-center justify-center'>
                  
                  <div className="cursor-pointer relative w-52 h-52 sm:w-60 sm:h-60 md:w-72 md:h-72 mt-14 mb-12">
                      <Image src={selectedModel[1].imageURL} layout="fill" alt="modelIllustration3"/>
                  </div>
  
                  <div>
                    <div className='text-xl w-full font-semibold px-12'>
                      {selectedModel[1].price}
                    </div>
  
                    <div className='text-xs w-full flex items-center justify-start font-semibold px-12'>
                      <TruckIcon className='w-4 h-4 mr-1'/> {t('home:prod:configurator:shipping')}
                    </div>
  
                    <div className='my-4 space-y-1'>
                      <div className='text-xs w-full flex items-center justify-start font-semibold px-12'>
                        <CheckCircleIcon className='w-4 h-4 mr-1 text-secondaryHover'/> {t('home:prod:configurator:packaging')}
                      </div>
                      <div className='text-xs w-full flex items-center justify-start font-semibold px-12'>
                        <CheckCircleIcon className='w-4 h-4 mr-1 text-secondaryHover'/> {t('home:prod:configurator:material')}
                      </div>
                      <div className='text-xs w-full flex items-center justify-start font-semibold px-12'>
                        <CheckCircleIcon className='w-4 h-4 mr-1 text-secondaryHover'/> {t('home:prod:configurator:holder')}
                      </div>
                      <div className='text-xs w-full flex items-center justify-start font-semibold px-12'>
                        <CheckCircleIcon className='w-4 h-4 mr-1 text-secondaryHover'/> {t('home:prod:configurator:activate')}
                      </div>
                    </div>
  
                    <div className='my-3 w-full flex flex-col justify-center items-center'>
                      <button onClick={(e)=>redirectToCheckout(e, "Keychain", null)} disabled={selectedModel[1].quantity > 0 ? false : true} className='bg-secondary cursor-pointer hover:bg-secondaryHover text-white font-bold rounded-lg px-12 py-4'>{t('home:prod:configurator:checkout')}</button>
                      {selectedModel[1].quantity > 0  ? <div className='text-green-500 text-xs italic mt-1'>{t('home:prod:configurator:stock')}</div> : <div className='text-red-500 text-xs italic mt-1'>{t('home:prod:configurator:outStock')}</div>}
                    </div>
                  </div>
  
                </div>
             </div>
          </section>
        )
      }
    }

    const renderProducts = (products) => {
      const cards = []

      products.forEach(product => {
          const name = product.id
          if(product.colors){
              const colors = product.colors
              colors.forEach(color => {
                  cards.push(
                      <div key={color.priceID} className="flex flex-col text-primary justify-center items-center w-[350px] h-[350px] px-4 py-4 rounded-lg shadow-lg hover:shadow-xl ">
                          <div className="text-lg font-bold ">{name} { } {color.color}</div>
                          <div className="text-sm font-bold mb-8">{color.price}</div>
                          <Image src={color.imageURL} width={144} height={144} alt=""/>
                          <button onClick={(e)=>redirectToCheckout(e, "Sticker", product)} disabled = {color.quantity > 0 ? false:true} className='bg-secondary text-sm mt-4 hover:bg-secondaryHover text-white font-bold rounded-lg px-8 py-4'>{t('home:prod:configurator:checkout')}</button>
                          {color.quantity > 0 ? 
                            <div className="text-sm text-emerald-500 mt-1 font-bold">{color.status}</div> :
                            <div className="text-sm text-red-500 mt-1 font-bold">{color.status}</div>
                          }
                      </div>
                  )
              })
          } else {
              cards.push(
                  <div key={product.data.priceID} className="flex flex-col text-primary justify-center items-center w-[350px] h-[350px] px-4 py-4 rounded-lg shadow-lg hover:shadow-xl ">
                      <div className="text-lg  font-bold  ">{name}</div>
                      <div className="text-sm  font-bold mb-8">{product.data.price} €</div>
                      <Image src={product.data.imageURL} width={144} height={144}  alt=""/>
                      <button onClick={(e)=>redirectToCheckout(e, "Sticker", product)} disabled = {product.data.quantity > 0 ? false:true} className='bg-secondary text-sm mt-4 hover:bg-secondaryHover text-white font-bold rounded-lg px-8 py-4'>{t('home:prod:configurator:checkout')}</button>
                      {product.data.quantity > 0 ? 
                        <div className="text-sm text-emerald-500 mt-1 font-bold">{product.data.status}</div> :
                        <div className="text-sm text-red-500 mt-1 font-bold">{product.data.status}</div>
                      }
                  </div>
              )
          }

      });
      return cards
  }

  function renderStickerCat(){
    if(productsJSON[1].length>0){
      return (
        <section id="">
          <div className='mt-20 text-gray-800 text-center mb-16 font-bold text-2xl sm:text-3xl md:text-4xl'>
            <span>Nos différents stickers</span>
          </div>
          <div className='w-full'>
            <div className={'grid gap-4 place-items-center grid-cols-1 '+(productsJSON[1].length > 1 ? "sm:grid-cols-2": "")}>
              {renderProducts(productsJSON[1])} 
            </div>
          </div>
        </section>
      )
    } else {
      return ''
    }
  }

  function renderTrackerCat(){
    if(productsJSON[2].length>0){
      return (
        <section id="">
          <div className='mt-20 text-gray-800 text-center mb-16 font-bold text-2xl sm:text-3xl md:text-4xl'>
            <span>Nos différents trackers</span>
          </div>
          <div className='w-full'>
            <div className={'grid gap-4 place-items-center grid-cols-1 '+(productsJSON[2].length > 1 ? "sm:grid-cols-2": "")}>
              {renderProducts(productsJSON[2])} 
            </div>
          </div>
        </section>
      )
    } else {
      return ''
    }
  }

  function renderOtherCat(){
    if(productsJSON[3].length>0){
      return (
        <section id="">
          <div className='mt-20 text-gray-800 text-center mb-16 font-bold text-2xl sm:text-3xl md:text-4xl'>
            <span>Nos autres produits</span>
          </div>
          <div className='w-full'>
            <div className={'grid place-items-center grid-cols-1 '+(productsJSON[3].length > 1 ? "sm:grid-cols-2": "")}>
              {renderProducts(productsJSON[3])} 
            </div>
          </div>
        </section>
      )
    } else {
      return ''
    }
  }

    return (
      <>
        {renderKeychainCat()}
        {renderStickerCat()}
        {renderTrackerCat()}
        {renderOtherCat()}
      </>

    )


}

export default ProductsSection
