import { CloudUploadIcon, BackspaceIcon } from "@heroicons/react/outline";
import { jsPDF } from "jspdf";

function ManageQR({ useRef, useState, toast, hostname, Modal, qrToGenerateJSON, findersJSON}) {
    
    const formNumberQR = useRef()

    /* menu state to show or not */
    const [isAddMenu, setIsAddMenu] = useState(true)
    const [isDropMenu, setIsDropMenu] = useState(true)
    const [isRewardMenu, setIsRewardMenu] = useState(true)

    /* for modal in section "generate qr" */
    const [showQRModal, setShowQRModal] = useState(false)
    const [modalQRID, setModalQRID] = useState('') 
    const [modalQREmail, setModalQREmail] = useState('') 

    /* for modal in section "finders" */
    const [showFinderModal, setShowFinderModal] = useState(false)
    const [modalFinderFullname, setModalFinderFullname] = useState('') 
    const [modalIban, setModalIban] = useState('') 
    const [modalOwnerFirstName, setModalOwnerFirstName] = useState('') 
    const [modalOwnerLastName, setModalOwnerLastName] = useState('') 
    const [modalId, setModalId] = useState('') 
    const [modalDonation, setModalDonation] = useState('') 
    const [modalRelaisNum, setModalRelaisNum] = useState('') 
    const [modalRelaisHeading, setModalRelaisHeading] = useState('') 

    const [file, setFile] = useState(null)

    const [loading, setLoading] = useState(false)
    
    function openQRModal(email, id){
        setModalQREmail(email)
        setModalQRID(id)
        setShowQRModal(prev => !prev);
    }

    function openFinderModal(finderFullname, iban, ownerFirstName, ownerLastName, id, donation, relaisNum, relaisHeading){
        setModalFinderFullname(finderFullname) 
        setModalIban(iban) 
        setModalOwnerFirstName(ownerFirstName) 
        setModalOwnerLastName(ownerLastName) 
        setModalId(id) 
        setModalDonation(donation) 
        setModalRelaisNum(relaisNum) 
        setModalRelaisHeading(relaisHeading) 
        setShowFinderModal(prev => !prev);
    }

    function getBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
    }

    const handleChange = async (e) => {
        e.preventDefault()
        if(e.target.files[0]){
            setFile(e.target.files[0])
        }
    }
    const handleReset = (e) => {
        e.preventDefault()
        setFile(null)
    }
    
    var tr = []
    var trf = []
    qrToGenerateJSON.forEach(element => {
        const email = element.email
        const id = element.id
        tr.push(
            <tr key={id} onClick={()=>openQRModal(email, id)} className={'cursor-pointer border-b-2 border-b-[#1B212E] text-white font-medium last-of-type:border-b-emerald-600'}>
                <td className='px-4 py-7 text-center'>{id}</td>
            </tr>
        )
    });

    findersJSON.forEach(element => {
        const finderFullname = element.fullName
        const iban = element.iban
        const ownerFirstName = element.ownerFirstName
        const ownerLastName = element.ownerLastName
        const id = element.id
        const donation = element.donation ? "Yes": "No"
        const relaisNum = element.relaisNum
        const relaisHeading = element.relaisHeading

        trf.push(
            <tr key={id+relaisNum} onClick={()=>openFinderModal(finderFullname, iban, ownerFirstName, ownerLastName, id, donation, relaisNum, relaisHeading)} className={'cursor-pointer border-b-2 border-b-[#1B212E] text-white font-medium last-of-type:border-b-emerald-600'}>
                <td className='px-4 py-7 text-white text-center'>{id}</td>
            </tr>
        )
    });

    const handleAdd = async (e) => {
        e.preventDefault()

        try{
            const data = {
                formNumberQR: formNumberQR.current.value
            }
            const response = await (fetch(`${hostname}/api/qr/add/`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) 
            }));
            const responseJSON = await (response.json())
            if(responseJSON.success){
                const doc = new jsPDF();
                doc.text(35, 25, (responseJSON.newQR).map(function(e){ return e+"\t"+"\n"}));
                doc.save("newQR.pdf");
                return toast.success("Success response !")
            } else {
                return toast.error("Error .. please contact amanpreet@outlook.be !")
            }
            
        } catch (err){
            return toast.error(err.message)
        }
    }

    const handleSubmit = async (e) => {
        try{
            getBase64(file).then(async (data) => {
                const dat = {
                    pdf: data,
                    email: modalQREmail,
                    id: modalQRID
                }
                await (fetch(`${hostname}/api/qr/addQRtoDB`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dat) 
                }));
                return toast.success("QR available to the finder")
            });
        } catch(err){
            return toast.error(err.message)
        }
    }
    const handleRewardSubmit = async (e) => {
    }
    return (
        <div className="mt-20 mx-12 lg:mx-auto px-12 py-12 bg-[#1B212E] max-w-4xl ">
            <div className="flex font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
                QR Manager
            </div>

            <div onClick={()=>setIsAddMenu(!isAddMenu)} className="flex mb-8 bg-emerald-600 hover:bg-emerald-500 transition duration-150 ease-in-out rounded-lg mx-2 sm:mx-12 px-8 py-4 sm:py-8 justify-center max-w-7xl xl:mx-auto items-center font-bold text-xl cursor-pointer shadow-lg">
                Add new QR
            </div>
            {isAddMenu ? 
            <div>
                <div className="mx-4 sm:mx-12 border-white ">
                    <label htmlFor="percent" className="block mt-4 text-sm font-medium">Number of new QR codes to add in database</label>
                    <div className="mt-1 max-w-sm">
                        <input id="percent" name="percent" type="number" ref={formNumberQR} required/>
                    </div>
                    <div className="flex justify-center items-center">
                        <button onClick={handleAdd} className="px-3 mt-12 py-4 font-medium border-2 border-blue-500 hover:border-blue-600 rounded-lg">Add new QR</button>
                    </div>
                </div>
            </div> : ""}

            <div onClick={()=>setIsDropMenu(!isDropMenu)} className="flex my-8 bg-emerald-600 hover:bg-emerald-500 transition duration-150 ease-in-out rounded-lg mx-2 sm:mx-12 px-8 py-4 sm:py-8 justify-center max-w-7xl xl:mx-auto items-center font-bold text-xl cursor-pointer shadow-lg">
                Generate QRs
            </div>
            {isDropMenu ? 
                <div className="mx-4 sm:mx-12">

                    <div className={"overflow-y-scroll " + (qrToGenerateJSON).length > 0 ? "h-[600px]" : ""}>
                        <table className='border-collapse outline-none w-3/4 max-w-5xl mx-auto shadow-lg'>
                            <thead>
                                <tr className='bg-[#242c3b] text-white text-center font-bold'>
                                    <th className='px-4 py-4'>QR's ID</th>
                                </tr>
                            </thead>
                            {(qrToGenerateJSON).length > 0 ? 
                                <tbody className=''>
                                    {tr}
                                </tbody>
                            :""}
                        </table>
                    </div>
                    {(qrToGenerateJSON).length > 0 ? "" :
                        <div className="flex flex-col py-10 justify-center items-center text-white font-bold bg-[#1B212E] text-md  w-3/4 mx-auto ">
                            No QR to generate yet
                        </div>}

                        <div className='absolute'>
                            <Modal showModal={showQRModal} setShowModal={setShowQRModal}>
                                <div className='w-full h-full flex flex-col justify-evenly items-center'>
                                    <h1 className='text-2xl font-mono'>Drop zone</h1>
                                    <ul className="list-disc font-medium mx-12">
                                        <li>The email of the owner is {modalQREmail}</li>
                                        <li>Enter a valid Mondial Relay QR code (pdf)</li>
                                        <li>Please double check if the QR code is the correct w.r.t QR ID</li>
                                    </ul>
                                    { file ? 
                                        <div className="flex flex-col justify-center items-center">
                                            <button onClick={handleSubmit} className="px-12 py-4 text-white font-bold bg-emerald-500 hover:bg-emerald-600 rounded-lg">VALIDATE</button>
                                            <div className="flex justify-end items-center my-4 text-sm">
                                                <div className='flex justify-center items-center cursor-pointer' onClick={handleReset}><BackspaceIcon className='w-7 h-7 mr-1'/>Reset</div>
                                            </div>
                                        </div>
                                        
                                        : 
                                        <div>
                                            <input type="file" name="file" id="file" className="w-[0.1px] h-[0.1px] opacity-0 overflow-hidden absolute -z-10 " onChange={handleChange} accept="image/png, image/jpeg, image/webp, application/pdf"  />
                                            <label htmlFor="file" className="font-medium cursor-pointer text-white bg-red-500 hover:bg-red-600 px-12 py-4 flex justify-center items-center"> 
                                                <CloudUploadIcon className="w-8 h-8 mr-1 " />Upload QR PDF
                                            </label>
                                        </div>
                                    }
                                </div>
                            </Modal>
                        </div>
                        

                    </div> : ""}

            <div onClick={()=>setIsRewardMenu(!isRewardMenu)} className="flex my-8 bg-emerald-600 hover:bg-emerald-500 transition duration-150 ease-in-out rounded-lg mx-2 sm:mx-12 px-8 py-4 sm:py-8 justify-center max-w-7xl xl:mx-auto items-center font-bold text-xl cursor-pointer shadow-lg">
                Reward finders
            </div>
            {isRewardMenu ? 
                <div className="mx-4 sm:mx-12">

                    <div className={"overflow-y-scroll " + (findersJSON).length > 0 ? "h-[600px]" : ""}>
                        <table className='border-collapse outline-none w-3/4 max-w-5xl mx-auto shadow-lg'>
                            <thead>
                                <tr className='bg-[#242c3b] text-white text-center font-bold'>
                                    <th className='px-4 py-4'>QR's ID</th>
                                </tr>
                            </thead>
                            {(findersJSON).length > 0 ? 
                                <tbody className=''>
                                    {trf}
                                </tbody>
                            :""}
                        </table>
                    </div>
                    {(findersJSON).length > 0 ? "" :
                        <div className="flex flex-col py-10 justify-center items-center text-white font-bold bg-[#1B212E] text-md  w-3/4 mx-auto ">
                            No finders yet
                        </div>}

                        <div className='absolute'>
                            <Modal showModal={showFinderModal} setShowModal={setShowFinderModal}>
                                <div className='w-full h-full flex flex-col justify-evenly items-center'>
                                    <h1 className='text-2xl font-mono'>Reward zone</h1>
                                    <ul className="list-disc font-medium mx-12">
                                        {modalFinderFullname ? <li>The fullname of the finder is {modalFinderFullname}</li> : ""}
                                        {modalIban ? <li>The IBAN of the finder is {modalIban}</li> : ""}
                                        <li>The relais name is {modalRelaisHeading}</li>
                                        <li>The relais num is {modalRelaisNum}</li>
                                        <li>The owner is {modalOwnerFirstName + " " + modalOwnerLastName}</li>
                                        <li>The email of the owner is {modalFinderFullname}</li>
                                        <li>The type of reward is a donation : {modalDonation}</li>
                                    </ul>
                                    <button onClick={handleRewardSubmit} className="px-12 py-4 text-white font-bold bg-emerald-500 hover:bg-emerald-600 rounded-lg">VALIDATE REWARD</button>
                                </div>
                            </Modal>
                        </div>
                        

                    </div> : ""}
        </div>
    )
}

export default ManageQR