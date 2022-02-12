/* Hero icon to illustrate upload */
import {CloudUploadIcon, BackspaceIcon} from '@heroicons/react/outline'

/* firebase v9 lib to handle new product */
import {storage} from '@lib/firebase'
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage'

function AddProducts({ useRef, useState, hostname, Image, toast }) {

    /* handle form values through ref */
    const type = useRef()
    const name = useRef()
    const color = useRef()
    const colorHex = useRef()
    const description = useRef()
    const price = useRef()
    const quantity = useRef()
    const [file, setFile] = useState(null)
    const [image, setImage] = useState('')
    const dashedBorder = image ? "": " border-dashed border-2 "

    const handleChange = (e) => {
        e.preventDefault()
        if(e.target.files[0]){
            setImage(URL.createObjectURL(e.target.files[0]))
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        const t = type.current.value.split(" ")
        if(!image && !file){
            return toast.error("Image du produit vide")
        } else if((!name.current.value) || (!quantity.current.value) || (!description.current.value) || (!price.current.value)){
            return toast.error("Every field is mandatory except the color !")
        } else if((t.length) > 1){
            return toast.error("Le type de produit en 1 mot")
        } else if (type.current.value == "Please choose a type"){
            return toast.error("Please choose a type")
        } else {
            const storageRef = ref(storage, `products/${type.current.value}/${file.name}`)
            uploadBytes(storageRef, file).then((snapshot) => {
                getDownloadURL(storageRef).then(async (url) => {
                    const data = {
                        type: type.current.value,
                        name: name.current.value,
                        color: color.current.value,
                        colorHex: colorHex.current.value,
                        description: description.current.value,
                        quantity: quantity.current.value,
                        price: price.current.value,
                        imageURL: url
                    }
                    const response = await (fetch(`${hostname}/api/products/add`, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data) 
                    }));
                    const responseJSON = await (response.json())
                    if(responseJSON.received){
                        setImage('')
                        setFile(null)
                        type.current.value = ""
                        name.current.value = ""
                        color.current.value = ""
                        colorHex.current.value = ""
                        description.current.value = ""
                        price.current.value = ""
                        quantity.current.value = ""
                        return toast.success("Success !")
                    } else {
                        setImage('')
                        setFile(null)
                        type.current.value = ""
                        name.current.value = ""
                        color.current.value = ""
                        colorHex.current.value = ""
                        description.current.value = ""
                        price.current.value = ""
                        quantity.current.value = ""
                        return toast.error("An error has occur, please contact amanpreet@outlook.be !")
                    }
                })
                
            })
        }
    }

    const handleReset = (e) => {
        e.preventDefault()
        setImage('')
        setFile(null)
    }
    return (

        <div className="mt-20 mx-12 lg:mx-auto px-12 py-12 bg-[#1B212E] max-w-4xl ">
            <div className="flex font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
                Add a new product
            </div>

            <div className="grid grid-cols-2 place-items-center font-bold text-xl">
                <div className='col-span-2 lg:col-span-1'>

                    <div className="mb-2">
                        <label htmlFor="type" className=" text-sm font-medium text-gray-200">Type of the product</label>
                        <div className="mt-1">
                            <select ref={type} name="type" id="type">
                                <option>Please choose a type</option>
                                <option>Keychain</option>
                                <option>Sticker</option>
                                <option>Tracker</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="name" className=" text-sm font-medium text-gray-200">Name of the product</label>
                        <div className="mt-1">
                            <input id="name" placeholder='Mandela, Square, etc.' name="name" type="text" ref={name} required/>
                        </div>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="color" className=" text-sm font-medium text-gray-200">Color</label>
                        <div className="mt-1">
                            <input id="color" placeholder='darkGray, blueRoyal, etc.' name="color" type="text" ref={color}/>
                        </div>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="colorHex" className=" text-sm font-medium text-gray-200">Color HEX</label>
                        <div className="mt-1">
                            <input id="colorHex" placeholder='' name="colorHex" type="text" ref={colorHex}/>
                        </div>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="quantity" className=" text-sm font-medium text-gray-200">Initial quantity</label>
                        <div className="mt-1">
                            <input id="quantity" name="quantity" type="number" ref={quantity} required/>
                        </div>
                    </div>
                    
                    <div className="mb-2">
                        <label htmlFor="description" className=" text-sm font-medium text-gray-200">Description</label>
                        <div className="mt-1">
                            <textarea className="resize-none" id="description" name="description" rows="3" minLength="10" maxLength="300" ref={description} required/>
                        </div>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="price" className=" text-sm font-medium text-gray-200">Prix [EUR]</label>
                        <div className="mt-1">
                            <input id="price" name="price" type="number" ref={price} required/>
                        </div>
                    </div>
                </div>

                <div className={"flex justify-center items-center flex-col w-[300px] h-[250px] mt-4 lg:mt-0 lg:w-full lg:h-full col-span-2 lg:col-span-1 "+dashedBorder}>
                    { image ? 
                        <div>
                            <div className="flex justify-end items-center w-full mb-4 text-sm">
                                <div className='flex justify-center items-center' onClick={handleReset}><BackspaceIcon className='w-7 h-7 mr-1'/> Reset</div>
                            </div>

                            <Image src={image} priority width={150} height={150} alt="imageProduct" /> 
                        </div>
                        : 
                        
                        <div>
                            <input type="file" name="file" id="file" className="w-[0.1px] h-[0.1px] opacity-0 overflow-hidden absolute -z-10 " onChange={handleChange} accept="image/png, image/jpeg, image/webp"  />
                            <label htmlFor="file" className="font-medium cursor-pointer bg-red-500 hover:bg-red-600 px-12 py-4 flex justify-center items-center"> 
                                <CloudUploadIcon className="w-8 h-8 mr-1 " />Upload image
                            </label>
                        </div>
                    }
                </div>

                <div className="col-span-2 mt-8">
                    <button onClick={handleSubmit} className="px-24 py-4 font-medium bg-emerald-500 hover:bg-emerald-600 rounded-lg">Créer le produit</button>
                </div>
            </div>
        </div>
    )
}

export default AddProducts
