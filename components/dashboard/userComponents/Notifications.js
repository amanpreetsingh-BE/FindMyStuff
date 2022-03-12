import { XIcon } from "@heroicons/react/outline";

export default function Notifications({ useState, useRef, Modal, t, hostname, toast, email, userNotificationsJSON}) {

  const notifClass = "grid place-items-center gap-8 grid-cols-1 mx-auto "
  const emptyNotifsClass = "flex justify-center items-center max-w-7xl mx-auto px-8 py-16"
  const [scanNotifs, setScanNotifs] = useState(true)
  const [deliveryNotifs, setDeliveryNotifs] = useState(true)
  const [clearing, setClearing] = useState(false)

  const clearScanNotifs = async (e) => {
    e.preventDefault()
    setClearing(true)
    try {
      const data = {
        email: email,
        type: "scan"
      }
  
      await (fetch(`${hostname}/api/qr/notifications/clear`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) 
      })).then(() =>{
        setScanNotifs(false)
      });
      
    } catch(err) {
      return toast.error(err.message)
    }
  }

  const clearDeliveryNotifs = async (e) => {
    e.preventDefault()
    setClearing(true)
    try {
      const data = {
        email: email,
        type: "delivery"
      }
  
      await (fetch(`${hostname}/api/qr/notifications/clear`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) 
      })).then(() =>{
        setDeliveryNotifs(false)
      });
    } catch(err){
      return toast.error(err.message)
    }
  }


  const renderScan = (notifications) => {
    const cards = []
    notifications.forEach(qr => {
      if(qr.scan.length > 0){
        var id = qr.id
        qr.scan.forEach((ns) => {
          if(ns.visible){
            cards.push(
              <div key={ns.timestamp} className={"flex flex-col justify-center cursor-pointer px-8 py-12 items-center w-full h-12 rounded-lg bg-[#1B212E] shadow-lg hover:shadow-lg"}>
                  <div className="text-lg font-bold ">{id}</div>
                  <div className='text-emerald-500 font-bold text-sm'>Scanned at : {new Date(ns.timestamp* 1000).toLocaleString()}</div> 
              </div>
            )
          }
        })
      }
    });

    if(cards.length == 0){
      return <div>There are no scan notifications</div>
    } else {
        return (
          <>
            <div className="flex w-full justify-end items-center "> 
              <button disabled={clearing} onClick={clearScanNotifs} className="flex border-2 px-2 py-2 rounded-lg cursor-pointer"><XIcon className="text-red-400 w-6 h-6"/>clear notifications</button>
            </div>
            {cards}
        </>)
    }
  }

  const renderDelivery = (notifications) => {
    const cards = []
    notifications.forEach(qr => {
      if(qr.delivery.length > 0){
        var id = qr.id
        qr.delivery.forEach((nd) => {
          if(nd.visible){
            cards.push(
              <div key={nd.timestamp} className="flex flex-col justify-center px-8 py-12 items-center w-full h-12 rounded-lg bg-[#1B212E] shadow-lg hover:shadow-lg">
                  <div className="text-lg font-bold ">{id}</div>
                  <div className='text-emerald-500 font-bold text-sm'>Scanned at : {new Date(nd.timestamp* 1000).toLocaleString()}</div>
              </div>
            )
          }
        })
      }
    });
    
    if(cards.length == 0){
      return <div>There are no delivery notifications</div>
    } else {
      return (
        <>
          <div className="flex w-full justify-end items-center "> 
            <button disabled={clearing} onClick={clearDeliveryNotifs} className="flex border-2 px-2 py-2 rounded-lg cursor-pointer"><XIcon className="text-red-400 w-6 h-6"/>clear notifications</button>
          </div>
          {cards}
      </>)
    }
    
  }

  return (
    <div className="mt-20 mx-12 lg:mx-auto px-12 py-12 bg-[#1B212E] max-w-4xl ">
        <div className="flex text-center font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
          {t('dashboard:user:notifPage:heading')}
        </div>


        <div className="flex text-center mb-8 border-2 border-blue-600 rounded-lg px-8 py-4 justify-center max-w-7xl xl:mx-auto items-center font-bold text-md shadow-lg">
        {t('dashboard:user:notifPage:h1')}
        </div>
        <div className={userNotificationsJSON.length > 0 ? notifClass : emptyNotifsClass}>
          {(userNotificationsJSON.length > 0 && scanNotifs) ? renderScan(userNotificationsJSON) : <div className="text-center max-w-sm">{t('dashboard:user:notifPage:empty1')}</div>}
        </div>
        <div className="flex text-center my-8 border-2 border-blue-600 rounded-lg px-8 py-4 justify-center max-w-7xl xl:mx-auto items-center font-bold text-md shadow-lg">
        {t('dashboard:user:notifPage:h2')}
        </div>
        <div className={userNotificationsJSON.length > 0 ? notifClass : emptyNotifsClass}>
          {(userNotificationsJSON.length > 0 && deliveryNotifs) ? renderDelivery(userNotificationsJSON) : <div className="text-center max-w-sm">{t('dashboard:user:notifPage:empty2')}</div>}
        </div>
        
    </div>
  )
}