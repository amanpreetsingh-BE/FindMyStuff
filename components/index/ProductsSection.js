/* Icons */
import {CheckCircleIcon, TruckIcon} from '@heroicons/react/solid'

/* fetch and paymentflow */
import axios from 'axios'
import getStripe from '@lib/stripe'

function ProductsSection({ motion, hostname, toast, Image, t, productsJSON, locale }) {

  /* Handle products */
  const redirectToCheckout = async (e, cat, product) => {
    e.preventDefault()
    try{
      const {
        data: {id}
      } = await axios.post(`${hostname}/api/checkout/`, {
        cat: cat,
        priceID: cat== "Keychain" ? product.priceID : product.data.priceID,
        model: cat== "Keychain" ? "Square keychain" : product.id, // to be changed in V2 to selectedModel[0].model
        color: cat== "Keychain" ? product.color : product.data.color,
        locale: locale,
        authorization: process.env.NEXT_PUBLIC_API_KEY
      })
      const stripe = await getStripe()
      const res = await stripe.redirectToCheckout({sessionId: id})
    
    } catch(err){
        //toast.error(t('home:stripe:error')) 
        toast.error(err.message) 
    }
  }

  const renderKeychains = () => {
    let sw = []
    const keychains = ((productsJSON[0])[0]).colors // if multiple keychains -> productsJSON[0]
    keychains.forEach((keychain) => {
      sw.push(
          <div key={keychain.priceID} className='flex items-center justify-center w-96 '>
            <motion.div whileHover={{ scale: 1.1 }}>
              <div className="bg-[#1B212E] relative px-6 py-8 rounded-lg flex flex-col ">
                <div className='flex flex-col justify-center items-center w-full pb-12'>
                  <div className='text-xl text-gray-300 font-semibold '>
                    {t('home:prod:configurator:price')} {keychain.price}
                  </div>
                  <div className='text-xs text-gray-300 flex items-center justify-start font-semibold'>
                    <TruckIcon className='w-4 h-4 mr-1'/> {t('home:prod:configurator:shipping')}
                  </div>

                </div>
                <div className='flex flex-col items-center'>
                  
                  <Image priority={true} src={keychain.imageURL} width={200} height={200} alt=""/>
                  <div className='my-4 text-gray-300 space-y-1'>
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
                </div>

                <div className='pt-2 w-full flex flex-col justify-center items-center'>
                  <button onClick={(e)=>redirectToCheckout(e, "Keychain", keychain)} disabled={keychain.quantity > 0 ? false : true} className='bg-secondary cursor-pointer hover:bg-secondaryHover text-white font-bold rounded-lg px-12 py-4'>{t('home:prod:configurator:checkout')}</button>
                  {keychain.quantity > 0  ? <div className='text-green-500 text-xs italic mt-1'>{t('home:prod:configurator:stock')}</div> : <div className='text-red-500 text-xs italic mt-1'>{t('home:prod:configurator:outStock')}</div>}
                </div>
              </div>
            </motion.div>
          </div>
      )
    })
    return sw
  }

  function renderKeychainCat() {
    return (
      <section id="products" className='bg-[#171C26]'>
        <div className='text-gray-300 text-center pt-8 mb-16 font-bold text-2xl sm:text-3xl md:text-4xl'>{t('home:prod:configurator:h1')}</div>
          <div className='w-full sm:pt-20 pb-60'>
            {productsJSON ? <div className='grid gap-8 place-items-center grid-cols-1 lg:grid-cols-2'>
              {renderKeychains()} 
            </div>:<div className='text-center text-sm'>Oops something is wrong .. Please try again by refreshing !</div>}
          </div> 
      </section>
    )
  }

  /*else {
    return (
      <section id="products" className='bg-[#171C26]' >
    
          <div className='w-full sm:pt-20 pb-60'>
            <div className='h-full flex flex-col sm:flex-row items-center justify-center'>
            

              <div>
                <div className='text-xl text-gray-300 w-full font-semibold px-12'>
                  {selectedModel[1].price}
                </div>

                <div className='text-xs text-gray-300 w-full flex items-center justify-start font-semibold px-12'>
                  <TruckIcon className='w-4 h-4 mr-1'/> {t('home:prod:configurator:shipping')}
                </div>

                <div className='my-4 text-gray-300 space-y-1'>
                  <div className='text-xs  w-full flex items-center justify-start font-semibold px-12'>
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
  }*/

    const renderProducts = (products) => {
      const cards = []

      products.forEach(product => {
          const name = product.id
          if(product.colors){
              const colors = product.colors
              colors.forEach(color => {
                  cards.push(
                    <motion.div key={color.priceID} whileHover={{ scale: 1.1 }}  whileTap={{ scale: 0.9 }}>
                      <div className="flex flex-col text-white cursor-pointer bg-[#1B212E] justify-center items-center w-[350px] h-[350px] px-4 py-4 mt-12  rounded-lg shadow-lg hover:shadow-xl ">
                            <div className="text-lg font-bold ">{name} { } {color.color}</div>
                            <div className="text-sm font-bold mb-8">{color.price}</div>
                            <Image priority={true} src={color.imageURL} width={144} height={144} alt=""/>
                            <button onClick={(e)=>redirectToCheckout(e, "Sticker", product)} disabled = {color.quantity > 0 ? false:true} className='bg-secondary text-sm mt-4 hover:bg-secondaryHover text-white font-bold rounded-lg px-8 py-4'>{t('home:prod:configurator:checkout')}</button>
                            {color.quantity > 0 ? 
                              <div className="text-sm text-emerald-500 mt-1 font-bold">{color.status}</div> :
                              <div className="text-sm text-red-500 mt-1 font-bold">{color.status}</div>
                            }
                      </div>
                    </motion.div>
                  )
              })
          } else {
              cards.push(
                  <motion.div key={product.data.priceID} whileHover={{ scale: 1.1 }}  whileTap={{ scale: 0.9 }}>
                    <div className="flex flex-col text-white cursor-pointer bg-[#1B212E] justify-center items-center w-[350px] h-[350px] px-4 py-4 mt-12 rounded-lg shadow-lg hover:shadow-xl ">
                          <div className="text-lg font-bold  ">{name}</div>
                          <div className="text-sm font-bold mb-8">{product.data.price} €</div>
                          <Image priority={true} src={product.data.imageURL} width={144} height={144}  alt=""/>
                          <button onClick={(e)=>redirectToCheckout(e, "Sticker", product)} disabled = {product.data.quantity > 0 ? false:true} className='bg-secondary text-sm mt-4 hover:bg-secondaryHover text-white font-bold rounded-lg px-8 py-4'>{t('home:prod:configurator:checkout')}</button>
                          {product.data.quantity > 0 ? 
                            <div className="text-sm text-emerald-500 mt-1 font-bold">{product.data.status}</div> :
                            <div className="text-sm text-red-500 mt-1 font-bold">{product.data.status}</div>
                          }
                    </div>
                  </motion.div>
              )
          }

      });
      return cards
  }

  function renderStickerCat(){
    if(productsJSON[1].length>0){
      return (
        <section id="" className='bg-[#171C26]'>
          <div className='text-gray-300 text-center mb-16 font-bold text-2xl sm:text-3xl md:text-4xl'> {t('home:prod:stickersCat:h1')}</div>
          <div className='w-full sm:pt-20 pb-60'>
            {productsJSON[1] ? <div className='grid place-items-center grid-cols-1 lg:grid-cols-2'>
              {renderProducts(productsJSON[1])} 
            </div>:<div className='text-center text-sm'>Oops something is wrong .. Please try again by refreshing !</div>}
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
        <section id="" className='bg-[#171C26]'>
          <div className='text-gray-300 text-center mb-16 font-bold text-2xl sm:text-3xl md:text-4xl'> {t('home:prod:trackerCat:h1')}</div>
          <div className='w-full sm:pt-20 pb-60'>
            {productsJSON[2] ? <div className='grid place-items-center grid-cols-1 lg:grid-cols-2'>
              {renderProducts(productsJSON[2])} 
            </div>:<div className='text-center text-sm'>Oops something is wrong .. Please try again by refreshing !</div>}
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
        <section id="" className='bg-[#171C26]'>
          <div className='text-gray-300 text-center mb-16 font-bold text-2xl sm:text-3xl md:text-4xl'> {t('home:prod:otherCat:h1')}</div>
          <div className='w-full sm:pt-20 pb-60'>
            {productsJSON[3] ? <div className='grid place-items-center grid-cols-1 lg:grid-cols-2'>
              {renderProducts(productsJSON[3])} 
            </div>:<div className='text-center text-sm'>Oops something is wrong .. Please try again by refreshing !</div>}
          </div>
        </section>
      )
    } else {
      return ''
    }
  }

    return (
      <div>
        {renderKeychainCat()}
        {renderStickerCat()}
        {renderTrackerCat()}
        {renderOtherCat()}
      </div>

    )


}

export default ProductsSection
