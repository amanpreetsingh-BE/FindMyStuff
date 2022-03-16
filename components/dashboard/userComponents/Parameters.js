/* Firebase components imports */
import {auth} from '@lib/firebase'
import {sendPasswordResetEmail} from 'firebase/auth'
import {useRouter} from 'next/router'
import {XIcon, MailIcon} from '@heroicons/react/outline'

export default function Parameters({ useState, useRef, Modal, t, hostname, toast, email, firstName, lastName, uid, user}) {

  const formFirstname = useRef()
  const formLastname= useRef()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  function openModal(){
    setShowModal(prev => !prev);
  }
  

  const resetPassword = async (e) => {
    e.preventDefault()
    sendPasswordResetEmail(auth, email)
    .then(() => {
      toast.success(t('dashboard:user:paramPage:forgot:emailSendSuccess')) 
    })
    .catch((error) => {
      const errorMessage = error.code;
      if(errorMessage=="auth/user-not-found"){
        return toast.error(t('dashboard:user:paramPage:forgot:emailSendUser'))
      } else if(errorMessage=="auth/missing-email"){
        return toast.error(t('dashboard:user:paramPage:forgot:forgot:emailSendEmpty'))
      } else if(errorMessage=="auth/invalid-email"){
        return toast.error(t('dashboard:user:paramPage:forgot:forgot:emailSendInvalid'))
      } else{
        return toast.error(t('dashboard:user:paramPage:forgot:forgot:errorEmailSend'))
      }
    });
  }
  
  const deleteAcc = async (e) => {
    e.preventDefault()
    try{
      const data = {
        uid: uid,
        email: email
      }
      const response = await (fetch(`${hostname}/api/user/settings/delete`, {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data) 
      }));
      const responseJSON = await (response.json())
      if(responseJSON.success){
        toast.success(t('dashboard:user:paramPage:delSuccess'))
        auth.updateCurrentUser(null).then(()=>{
          router.push('/')
        })
      }
    } catch(err){
      return toast.error(err.message)
    }
  }

  const updateAcc = async (e) => {
    e.preventDefault()
    const re = /^[a-zA-Z]*$/
    console.log()
    if(formFirstname.current.value == "" && formLastname.current.value == ""){
      return toast.error(t('dashboard:user:paramPage:updateFL'))
    } else if((!re.test(formFirstname.current.value)) || (!re.test(formLastname.current.value))){ // number and special characters test
      return toast.error(t('dashboard:user:paramPage:updateSpecialC'))
    } else if ( ((formFirstname.current.value).length > 26) || ((formLastname.current.value).length > 26)){
      return toast.error(t('dashboard:user:paramPage:tooMuch'))
    } else if ( (!(formFirstname.current.value == "") && ((formFirstname.current.value).length < 3)) || ((!(formLastname.current.value == "") && ((formLastname.current.value).length < 3) ))){
      return toast.error(t('dashboard:user:paramPage:tooSmall'))
    } else {
      try{
        const data = {
          uid: uid,
          firstName: formFirstname.current.value == "" ? firstName : formFirstname.current.value,
          lastName: formLastname.current.value == "" ? lastName : formLastname.current.value,
          authorization: process.env.NEXT_PUBLIC_API_KEY
        }
        const response = await (fetch(`${hostname}/api/user/settings/updateInfo`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) 
        }));
        const responseJSON = await (response.json())
        if(responseJSON.success){
          toast.success(t('dashboard:user:paramPage:pupdate'))
        }
      } catch(err){
        return toast.error(err.message)
      }
    }

  }

  return (
    <div className="mt-20 mx-12 lg:mx-auto px-12 py-12 bg-[#1B212E] max-w-4xl ">
        <div className="flex text-center font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
          {t('dashboard:user:paramPage:heading')}
        </div>
        <div className="flex mb-8 text-center border-2 border-blue-600 rounded-lg px-8 py-4 justify-center max-w-7xl xl:mx-auto items-center font-bold text-md shadow-lg">
          {t('dashboard:user:paramPage:h1')}
        </div>
        <div className=''>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200">{t('dashboard:user:paramPage:email')}</label>
          <div className="mt-1 max-w-xs">
            <input id="email" name="email" type="email" placeholder={email} readOnly required/>
          </div>

          <label htmlFor="textFirstname" className="block text-sm font-medium text-gray-200 mt-6">{t('dashboard:user:paramPage:firstname')}</label>
          <div className="mt-1 max-w-xs">
            <input id="textFirstname" name="textFirstname" type="text" ref={formFirstname} placeholder={firstName} required/>
          </div>

          <label htmlFor="textLastname" className="block text-sm font-medium text-gray-200 mt-6">{t('dashboard:user:paramPage:lastname')}</label>
          <div className="mt-1 max-w-xs">
            <input id="textLastname" name="textLastname" type="text" ref={formLastname} placeholder={lastName} required/>
          </div>
          <div className='flex justify-center items-center'>
            <button onClick={updateAcc} className="max-w-lg py-3 px-8 mx-auto my-4 font-bold text-md border-2 border-emerald-500 hover:border-emerald-600 rounded-lg">{t('dashboard:user:paramPage:update')}</button>
          </div>
        </div>

        <div className="flex my-8 text-center border-2 border-blue-600 rounded-lg px-8 py-4 justify-center max-w-7xl xl:mx-auto items-center font-bold text-md shadow-lg">
        {t('dashboard:user:paramPage:h2')}
        </div>
        
        <div className="flex mt-4 text-sm font-bold">
          <ul className="space-y-4" >
            <li onClick={resetPassword} className='cursor-pointer flex justify-start items-center'> <MailIcon className='w-4 h-4 mr-1'/>{t('dashboard:user:paramPage:reset')}</li>
            <li onClick={openModal} className='cursor-pointer text-red-400 flex justify-start items-center'> <XIcon className='w-4 h-4 mr-1'/>{t('dashboard:user:paramPage:delete')}</li>
            <div className='absolute'>
              <Modal showModal={showModal} setShowModal={setShowModal}>
                  <div className='w-full h-full flex flex-col justify-start items-center'>
                      <h1 className='text-xl font-mono pt-16'>{t('dashboard:user:paramPage:h2')}</h1>
                  </div>
                  <ul className='list-disc space-y-3 font-normal px-12'>
                    <li>{t('dashboard:user:paramPage:del1')}</li>
                    <li>{t('dashboard:user:paramPage:del2')}</li>
                    <li>{t('dashboard:user:paramPage:del3')}</li>
                  </ul>
                  <button onClick={deleteAcc} className="px-8 h-12 text-white mx-auto font-bold text-md bg-red-500 hover:bg-red-600 rounded-lg">{t('dashboard:user:paramPage:delBtn')}</button>

              </Modal>
          </div>
          </ul>
        </div>
    </div>
  )
}