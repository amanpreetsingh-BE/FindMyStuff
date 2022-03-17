/* React imports */
import {useRef} from 'react'

function ContactSection({t, hostname, useState, toast}) {

    /* Handle contact form */
    const formEmail = useRef()
    const formFullName = useRef()
    const formMessage = useRef()
    const [contacted, setContacted] = useState(false)

    const postMessage = async (e) => {
        e.preventDefault()
        setContacted(true)

        const data = {
            email: formEmail.current.value,
            fullname: formFullName.current.value,
            message: formMessage.current.value,
            authorization: process.env.NEXT_PUBLIC_API_KEY,
        }
        try {
            const response = await (fetch('/api/messages/post-message', {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }));
            const responseJSON = await (response.json())

            const notify = await (fetch('/api/mailer/notify-message', {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }));
            const notifyJSON = await (notify.json())

            formEmail.current.value = ""
            formFullName.current.value = ""
            formMessage.current.value = ""
            
            if(responseJSON.success && notifyJSON.success){
                return toast.success(t('home:contact:success'))
            } else {
                return toast.error(t('home:contact:error'))
            }
        } catch(err){
            return toast.error(t('home:contact:error'))
        }
    }

    return(
        <section id="contact" className="flex text-white flex-col md:flex-row items-center justify-evenly bg-secondary w-full h-[700px] min-h-[700px]">
        
            <div className="h-1/4 w-full md:h-full md:w-5/12 md:max-w-lg flex flex-col items-center justify-center font-extrabold text-2xl md:text-2xl lg:text-3xl xl:text-4xl">
                <div>{t('home:contact:heading')}</div>
                <div>{t('home:contact:subtitle')}</div>
            </div>

            <div className="h-3/4 w-full md:h-full md:w-7/12 md:max-w-lg flex flex-col items-center justify-center font-extrabold text-lg sm:text-xl md:text-xl lg:text-2xl">
                <div className="w-8/12 min-w-[320px] h-full md:w-5/6 md:h-3/4 min-h-[400px] bg-gray-100 rounded-3xl flex justify-center items-center">
                    <form className="mb-0 w-10/12 h-10/12 space-y-4" onSubmit={postMessage} action="">
                    <label htmlFor="text" className="block text-sm font-medium text-gray-700">{t('home:contact:name')}</label>
                    <div className="mt-1">
                        <input id="text" name="text" type="text" maxLength="26" minLength="3" ref={formFullName} required/>
                    </div>

                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('home:contact:email')}</label>
                    <div className="mt-1">
                        <input id="email" name="email" type="email" autoComplete="email" maxLength="26" minLength="3" ref={formEmail} required/>
                    </div>

                    <label htmlFor="msg" className="block text-sm font-medium text-gray-700">{t('home:contact:msg')}</label>
                    <div className="mt-1">
                        <textarea className="resize-none" id="msg" name="msg" rows="5" minLength="10" maxLength="300" ref={formMessage} required/>
                    </div>
                    <div className="flex items-center justify-center">
                        <button disabled={contacted} className="px-14 py-4 font-medium text-sm bg-indigo-500 hover:bg-indigo-600 rounded-2xl">{t('home:contact:submit')}</button>
                    </div>

                    </form>
                </div>
            </div>

        </section>
    )
}
export default ContactSection