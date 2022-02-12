export default function Promo({ useState, useRef, toast, hostname, Modal, couponsJSON }) {
  
    /* Coupons menu state : open or closed */
    const [isCouponsMenu, setIsCouponsMenu] = useState(true)
    /* Add coupons menu state : open or closed */
    const [isAddMenu, setIsAddMenu] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [modalPromoID, setModalPromoID] = useState('')
    const [modalCouponID, setModalCouponID] = useState('')
    const [modalCodeName, setModalCodeName] = useState('')
    const [modalOFF, setModalOFF] = useState('')

    function openModal(){
        setShowModal(prev => !prev);
    }
    const formCoupon = useRef()
    const formPercentage = useRef()


    const couponsClass = "grid place-items-center gap-8 grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto px-12 py-16"
    const emptyCouponsClass = "flex justify-center items-center max-w-7xl mx-auto px-8 py-16"

    const handleAdd = async (e) => {
        e.preventDefault()
        if(formCoupon.current.value == "" || formPercentage.current.value == ""){
            return toast.error("Name and percentage are mandatory !")
        } else {
            const data = {
                code: formCoupon.current.value,
                percent: formPercentage.current.value, 
            }
            const response = await (fetch(`${hostname}/api/promo/add`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) 
            }));
            const responseJSON = await (response.json())
            if(responseJSON.success){
                return toast.success("Successful response !")
            } else {
                return toast.error(responseJSON.err)
            }
        }
        
    }

    const handleDel = async (e) => {
        e.preventDefault()
        const data = {
            promoID: modalPromoID,
            couponID: modalCouponID
        }
        const response = await (fetch(`${hostname}/api/promo/delete`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) 
        }));
        const responseJSON = await (response.json())
        if(responseJSON.success){
            return toast.success("Successful response !")
        } else {
            return toast.error(responseJSON.err)
        }
    }

    const renderProducts = (coupons) => {
        const cards = []

        function openStockModal(promoID, couponID, codeName, off){
            setModalPromoID(promoID) 
            setModalCouponID(couponID) 
            setModalCodeName(codeName)
            setModalOFF(off)
            openModal()
        }

        coupons.forEach(coupon => {
            const promoID = coupon.id
            const couponID = coupon.coupon.id
            const codeName = coupon.code
            const off = coupon.coupon.percent_off
            cards.push(
                <div key={promoID} onClick={()=>openStockModal(promoID, couponID, codeName, off)} className="flex flex-col justify-center items-center w-80 h-80 rounded-lg bg-[#1B212E] shadow-lg hover:shadow-lg hover:bg-[#171C26] cursor-pointer">
                    <div className="text-lg font-bold mb-8 ">{codeName}</div>
                </div>
            )

        });
        return cards
    }

    return (
        <div className="mt-20 mx-12 lg:mx-auto px-1 py-12 max-w-4xl ">
            <div className="flex font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
                Manage coupons
            </div>

            <div onClick={()=>setIsCouponsMenu(!isCouponsMenu)} className="flex mb-8 bg-emerald-600 hover:bg-emerald-500 transition duration-150 ease-in-out rounded-lg mx-12 px-8 py-8 justify-center max-w-7xl xl:mx-auto items-center font-bold text-xl cursor-pointer shadow-lg">
                List of active coupons
            </div>

            {isCouponsMenu ? <div className={couponsJSON.length > 0 ? couponsClass : emptyCouponsClass}>
                {couponsJSON.length > 0 ? renderProducts(couponsJSON) : <div>No Items</div>}
                <div className='absolute'>
                    <Modal showModal={showModal} setShowModal={setShowModal}>
                        <div className='w-full h-full flex flex-col justify-evenly items-center'>
                            <h1 className='text-2xl font-mono'>Coupons Manager</h1>
                            <ul className="list-disc font-medium">
                                <li>
                                    Promo ID : {modalPromoID}
                                </li>
                                <li>
                                    Coupon ID : {modalCouponID}
                                </li>
                                <li>
                                    Code name : {modalCodeName}
                                </li>      
                                <li>
                                    Percentage off : {modalOFF+ "%"}
                                </li>
                              
                            </ul>
                            <button onClick={handleDel} className='px-8 py-4  bg-red-600 hover:bg-red-500 rounded-md text-white'>Delete</button>
                        </div>
                    </Modal>
                </div>
            </div> : ""}

            <div onClick={()=>setIsAddMenu(!isAddMenu)} className="flex mb-8 bg-emerald-600 hover:bg-emerald-500 cursor-pointer transition duration-150 ease-in-out rounded-lg mx-12 px-8 py-8 justify-center max-w-7xl xl:mx-auto items-center font-bold text-xl shadow-lg">
                Add coupons
            </div>
            {isAddMenu ? <div>
                <div className="mx-auto px-2 border-white ">
                    <label htmlFor="coupon" className="block text-sm font-medium">Coupon name</label>
                    <div className="mt-1 max-w-sm">
                        <input id="coupon" name="coupon" type="text" ref={formCoupon} required/>
                    </div>
                    <label htmlFor="percent" className="block mt-4 text-sm font-medium">Percentage off</label>
                    <div className="mt-1 max-w-sm">
                        <input id="percent" name="percent" type="number" ref={formPercentage} required/>
                    </div>
                    <div className="flex justify-center items-center">
                        <button onClick={handleAdd} className="px-3 mt-12 py-4 font-medium bg-blue-500 hover:bg-blue-600 rounded-lg">Create a new coupon</button>
                    </div>
                </div>
            </div> : ""}
            
        </div>
    )
}