function NewAdmin({ useRef, toast, authorization }) {
  const formEmail = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      email: formEmail.current.value,
      authorization: authorization,
    };
    try {
      const response = await fetch(`/api/user/newAdmin`, {
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
      }
    } catch (err) {
      console.log(err.message);
      return toast.error(err.message);
    }
  };

  return (
    <div className="mt-20 mx-12 lg:mx-auto px-12 py-12 bg-[#1B212E] max-w-4xl ">
      <div className="flex font-mono justify-center items-center font-bold text-2xl lg:text-3xl mb-8">
        Create a new Admin
      </div>
      <label htmlFor="email" className="block text-sm font-medium">
        Email
      </label>
      <div className="mt-1 max-w-sm">
        <input id="email" name="email" type="email" ref={formEmail} required />
      </div>
      <div className="flex justify-center items-center">
        <button
          onClick={handleSubmit}
          className="px-24 mt-12 py-4 font-medium bg-emerald-500 hover:bg-emerald-600 rounded-lg"
        >
          Create a new admin
        </button>
      </div>
    </div>
  );
}

export default NewAdmin;
