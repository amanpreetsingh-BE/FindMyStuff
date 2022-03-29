import { CloudUploadIcon, BackspaceIcon } from "@heroicons/react/outline";
/* firebase v9 lib to handle new product */
import { storage } from "@lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

function Newsletter({ useState, useRef, toast, authorization }) {
  const title = useRef();
  const message = useRef();

  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (title.current.value == "" || message.current.value == "") {
        return toast.error("Title or text is empty !");
      }
      if (file) {
        const storageRef = ref(storage, `mailer/newsletter/${file.name}`);
        uploadBytes(storageRef, file).then((snapshot) => {
          getDownloadURL(storageRef).then(async (url) => {
            const data = {
              title: title.current.value,
              message: message.current.value,
              fileURL: url,
              fileName: file.name,
              authorization: authorization,
            };
            const response = await fetch(`/api/mailer/send-newsletter`, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });
            const responseJSON = await response.json();
            if (responseJSON.received) {
              return toast.success("Successful response !");
            } else {
              return toast.error("Error, please contact amanpreet@outlook.be");
            }
          });
        });
      } else {
        const data = {
          title: title.current.value,
          message: message.current.value,
          fileURL: null,
          fileName: null,
          authorization: authorization,
        };
        const response = await fetch(`/api/mailer/send-newsletter`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const responseJSON = await response.json();
        if (responseJSON.received) {
          return toast.success("Successful response !");
        } else {
          return toast.error("Error, please contact amanpreet@outlook.be");
        }
      }
    } catch (err) {
      return toast.error(err.message);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFile(null);
  };

  return (
    <div className="mt-20 mx-12 lg:mx-auto px-12 py-12 bg-[#1B212E] max-w-4xl ">
      <div className="flex font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
        Send a newsletter
      </div>
      <label htmlFor="title" className="block text-sm font-medium">
        Title
      </label>
      <div className="mt-1 max-w-sm">
        <input id="title" name="title" type="text" ref={title} required />
      </div>
      <label htmlFor="msg" className="block mt-12 text-sm font-medium">
        Text (HTML)
      </label>
      <div className="mt-1">
        <textarea
          className="resize-none"
          id="msg"
          name="msg"
          cols="10"
          rows="10"
          minLength="10"
          ref={message}
          required
        />
      </div>
      {file ? (
        <>
          {file.name}
          <div className="flex justify-end items-center w-full mb-4 text-sm">
            <div
              className="flex justify-center cursor-pointer items-center"
              onClick={handleReset}
            >
              <BackspaceIcon className="w-7 h-7 mr-1" /> Reset
            </div>
          </div>
        </>
      ) : (
        <>
          <input
            type="file"
            name="file"
            id="file"
            className="w-[0.1px] h-[0.1px] opacity-0 overflow-hidden absolute -z-10 "
            onChange={handleChange}
          />
          <label
            htmlFor="file"
            className="font-medium cursor-pointer text-white bg-blue-500 hover:bg-blue-600 px-8 py-4 mt-8 flex justify-center items-center"
          >
            <CloudUploadIcon className="w-8 h-8 mr-1 " />
            Upload file
          </label>
        </>
      )}
      <div className="flex justify-center items-center">
        <button
          onClick={handleSubmit}
          className="px-24 mt-12 py-4 font-medium bg-emerald-500 hover:bg-emerald-600 rounded-lg"
        >
          Send a newsletter
        </button>
      </div>
    </div>
  );
}

export default Newsletter;
