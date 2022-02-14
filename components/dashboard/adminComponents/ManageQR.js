function ManageQR({ useRef, useState, toast, hostname }) {

    const formNumberQR = useRef()
    const [newQR, setNewQR] = useState('');

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
                setNewQR(responseJSON.newQR)
                return toast.success("Success response !")
            } else {
                return toast.error("Error .. please contact amanpreet@outlook.be !")
            }
            
        } catch (err){
            return toast.error(err.message)
        }
    }

    return (
        <div className="mt-20 mx-12 lg:mx-auto px-12 py-12 bg-[#1B212E] max-w-4xl ">
            <div className="flex font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
                QR Manager
            </div>
            <div>
                <div className="mx-auto border-white ">
                    <label htmlFor="percent" className="block mt-4 text-sm font-medium">Number of new QR codes to add in database</label>
                    <div className="mt-1 max-w-sm">
                        <input id="percent" name="percent" type="number" ref={formNumberQR} required/>
                    </div>
                    <div className="flex justify-center items-center">
                        <button onClick={handleAdd} className="px-3 mt-12 py-4 font-medium bg-blue-500 hover:bg-blue-600 rounded-lg">Add new QR</button>
                    </div>
                </div>
            </div>
            <div>
                {newQR ? <ul>{newQR.map((qr) => <li>{qr}</li>)}</ul> : ""}
            </div>
        </div>
    )
}

export default ManageQR
