function LanguageBox({Image, locale}){
    const en_flag = require('@images/icons/gb.svg')
    const fr_flag = require('@images/icons/fr.svg')
    //const nl_flag = require('@images/icons/nl.svg')
    //const flag = (locale === "en" ? en_flag : locale === "fr" ? fr_flag : nl_flag)
    const flag = (locale === "en" ? en_flag : fr_flag)

    return (
        <div className="group inline-block relative">
            <button className="bg-transparent text-gray-700 font-semibold py-3 pl-2 rounded inline-flex items-center">
                <span className="mr-2 pt-1">
                    <Image src={flag} priority quality="100" width={30} height={22} alt="flag"/>
                </span>

                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
            </button>
            <ul className="absolute hidden text-gray-700 pt-1 group-hover:block">
                <li className="">
                    <a href="/en"
                    className="rounded-t cursor-pointer bg-transparent hover:bg-gray-400 py-2 px-2 block whitespace-no-wrap"
                    ><Image src={en_flag} priority quality="100" width={30} height={22} alt="flag"/></a>
                </li>
                <li className="">
                    <a href="/fr"
                    className="bg-transparent cursor-pointer hover:bg-gray-400 py-2 px-2 block whitespace-no-wrap"
                    ><Image src={fr_flag} priority quality="100" width={30} height={22} alt="flag"/></a>
                </li>
                {/*<li className="">
                    <a href="/nl"
                    className="rounded-b cursor-pointer bg-transparent hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
                    ><Image src={nl_flag} priority quality="100" width={30} height={22} alt="flag"/></a>
                </li>*/}
            </ul>
        </div>
    )
}

export default LanguageBox