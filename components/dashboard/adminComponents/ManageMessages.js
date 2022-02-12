import {CloudUploadIcon, BackspaceIcon} from '@heroicons/react/outline'
/* firebase v9 lib to handle new product */
import {storage} from '@lib/firebase'
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage'

function ManageMessages({ useState, hostname, useRef, Modal, messagesJSON, t, toast }) {

    /* Modal variables states for orders */
    const [modalContactMessage, setModalContactMessage] = useState('')
    const [modalContactID, setModalContactID] = useState('')
    const [modalFullname, setModalFullname] = useState('')
    const [modalReplied, setModalReplied] = useState(null)
    const [showModalMessage, setShowModalMessage] = useState(false)
    const [modalEmail, setModalEmail] = useState("")
    const [replyState, setReplyState] = useState(false)
    const [replied, setReplied] = useState(false)
    const [file, setFile] = useState(null)
    const formTitle = useRef()
    const formMessage = useRef()

    function openModalMessage(){
        setShowModalMessage(prev => !prev);
    }
    var tr = []

    function openContactModal(message, id, replied, email, fullname){
        setModalContactMessage(message)
        setModalFullname(fullname)
        setModalContactID(id)
        setModalReplied(replied)
        setModalEmail(email)
        openModalMessage()
    }


    const updateMessage = async (e) => {
        e.preventDefault()
       
        if(!formTitle.current.value || !formMessage.current.value){
            return toast.error("Title and message is mandatory !")
        }
        try {
            if(modalReplied){
                return toast.error("Error, already marked as replied")
            }
            if(file){
                setReplied(true)
                const storageRef = ref(storage, `mailer/${modalContactID}/${file.name}`)
                uploadBytes(storageRef, file).then((snapshot) => {
                    getDownloadURL(storageRef).then(async (url) => {
                        const data = {
                            id: modalContactID,
                            fullname: modalFullname,
                            modalEmail: modalEmail,
                            formTitle: formTitle.current.value,
                            formMessage: formMessage.current.value,
                            fileURL: url,
                            fileName : file.name
                        }
                        const response = await (fetch(`${hostname}/api/mailer/send-message`, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data) 
                        }));
                        const responseJSON = await (response.json())
                        if(responseJSON.received){
                            return toast.success("Successful response !")
                        } else{
                            return toast.error("Error, please contact amanpreet@outlook.be")
                        }
                    })  
                })
            } else {
                setReplied(true)
                const data = {
                    id: modalContactID,
                    fullname: modalFullname,
                    modalEmail: modalEmail,
                    formTitle: formTitle.current.value,
                    formMessage: formMessage.current.value,
                    fileURL : null,
                    fileName : null
                }
                const response = await (fetch(`${hostname}/api/mailer/send-message`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data) 
                }));
                const responseJSON = await (response.json())
                if(responseJSON.received){
                    return toast.success("Successful response !")
                } else{
                    return toast.error("Error, please contact amanpreet@outlook.be")
                }
            }
        } catch(err){
            return toast.error("Error, please contact amanpreet@outlook.be")
        }
    }

    const handleChange = (e) => {
        e.preventDefault()
        if(e.target.files[0]){
            setFile(e.target.files[0])
        }
    }
    const handleReset = (e) => {
        e.preventDefault()
        setFile(null)
    }

    messagesJSON.forEach(element => {
        const message = element.message
        const id = element.id
        const fullname = element.fullname
        const email = element.email
        const replied = element.replied
        const bgColor = element.replied ? 'bg-emerald-600' :'bg-red-500'
        tr.push(
            <tr key={element.timestamp} onClick={()=>openContactModal(message, id, replied, email, fullname)} className={'cursor-pointer border-b-2 border-b-[#1B212E] text-white font-medium last-of-type:border-b-emerald-600   ' + bgColor}>
                <td className='px-4 py-7'>{email}</td>
                <td className='px-4 py-7'>{fullname}</td>
                <td className='px-4 py-7'>{new Date(element.timestamp* 1000).toLocaleString()}</td>
                <td className='px-4 py-7'>{replied ? 'Replied':'Not replied'}</td>
            </tr>
        )
    });

    return (
        <div className="space-y-4 mt-20 ">
            <div className="flex font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
                {t('dashboard:admin:messsagesClient')}
            </div>
            <div className="overflow-y-scroll h-[600px]">
                <table className='border-collapse outline-none w-3/4 max-w-5xl mx-auto shadow-lg'>
                    <thead>
                        <tr className='bg-[#1B212E] text-white text-left font-bold'>
                            <th className='px-4 py-4'>Email</th>
                            <th className='px-4 py-4'>Fullname</th>
                            <th className='px-4 py-4'>Date</th>
                            <th className='px-4 py-4'>Status</th>
                        </tr>
                    </thead>
                    {(messagesJSON).length > 0 ?
                        <tbody className=''>
                            {tr}
                        </tbody>
                    :""}
                </table>
            </div>

        {(messagesJSON).length > 0 ? "" :
        <div className="flex flex-col justify-center items-center text-white font-bold bg-[#1B212E] py-10  text-md  w-3/4 max-w-5xl mx-auto mt-10">
            No messages yet :(
        </div>}

        <div className='absolute'>
            <Modal showModal={showModalMessage} setShowModal={setShowModalMessage}>
                {replyState ? 
                <div className='w-full h-full flex flex-col px-12 py-12 justify-start items-start'>
                    <div className='grid gap-4 place-items-center grid-cols-2'>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <div className="mt-1 ">
                                <input id="title" name="title" type="text" ref={formTitle} required/>
                            </div>
                            <label htmlFor="msg" className="block text-sm font-medium text-gray-700 mt-2">Response</label>
                            <div className="mt-1">
                                <textarea className="resize-none" id="msg" name="msg" rows="3" minLength="10" ref={formMessage} required/>
                            </div>
                        </div>

                        <div>
                            {file ? <>
                                {file.name}
                                <div className="flex justify-end items-center w-full mb-4 text-sm">
                                    <div className='flex justify-center items-center' onClick={handleReset}><BackspaceIcon className='w-7 h-7 mr-1'/> Reset</div>
                                </div>
                            </>
                            :<>
                                <input type="file" name="file" id="file" className="w-[0.1px] h-[0.1px] opacity-0 overflow-hidden absolute -z-10 " onChange={handleChange} />
                                <label htmlFor="file" className="font-medium cursor-pointer text-white bg-indigo-500 hover:bg-indigo-600 px-8 py-4 flex justify-center items-center"> 
                                    <CloudUploadIcon className="w-8 h-8 mr-1 " />Upload file
                                </label>
                            </>}
                        </div>
                        <div className='col-span-2'>
                            <button disabled={replied} onClick={updateMessage} className='px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-md text-white'>
                                Send email
                            </button>
                        </div>
                        <div className='col-span-2'>
                            <button onClick={()=>setReplyState(false)} className='px-8 py-4 bg-red-600 hover:bg-red-500 rounded-md text-white'>
                                Go back
                            </button>
                        </div>
                    </div>

                </div>
                : <div className='w-full h-full flex flex-col justify-evenly items-center'>
                    <h1 className='text-2xl font-mono'>Message :</h1>
                    <div className='text-sm max-w-sm break-words'>
                        {modalContactMessage}
                    </div>
                    <button onClick={()=>setReplyState(true)} className='px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white'>
                        Reply
                    </button>
                </div>}
            </Modal>
        </div>

    </div>
    )
}

export default ManageMessages
