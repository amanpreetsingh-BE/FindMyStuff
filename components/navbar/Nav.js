import React, { useContext } from 'react'
import { UserContext } from '@lib/context'
import Image from 'next/image'
import Link from 'next/link'
import {Link as LinkS, animateScroll as scroll} from 'react-scroll'
import { MenuAlt3Icon } from '@heroicons/react/outline'
import { useTranslation } from 'next-i18next'

function Nav(props) {

    const { t } = useTranslation();

    const en_flag = require('@images/icons/gb.svg')
    const fr_flag = require('@images/icons/fr.svg')
    const nl_flag = require('@images/icons/nl.svg')
    const logo = require('@images/icons/logo_white.svg');

    const flag = (props.loc === "en" ? en_flag : props.loc === "fr" ? fr_flag : nl_flag)

    const { user, email } = useContext(UserContext)
    
    function toggleHome() {
        scroll.scrollToTop();
    }

    function languageBox(){
        return (
            <div className="group inline-block relative">
                <button
                className="bg-transparent text-gray-700 font-semibold py-3 px-4 rounded inline-flex items-center"
                >
                
                    <span className="mr-2 pt-1">
                        <Image src={flag} priority quality="100" width={30} height={22} alt="flag"/>
                    </span>

                    <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                    >
                        <path
                        d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                        />
                    </svg>
                </button>
                <ul className="absolute hidden text-gray-700 pt-1 group-hover:block">
                    <li className="">
                        <a href="/en"
                        className="rounded-t cursor-pointer bg-transparent hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
                        ><Image src={en_flag} priority quality="100" width={30} height={22} alt="flag"/></a>
                    </li>
                    <li className="">
                        <a href="/fr"
                        className="bg-transparent cursor-pointer hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
                        ><Image src={fr_flag} priority quality="100" width={30} height={22} alt="flag"/></a>
                    </li>
                    <li className="">
                        <a href="/nl"
                        className="rounded-b cursor-pointer bg-transparent hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
                        ><Image src={nl_flag} priority quality="100" width={30} height={22} alt="flag"/></a>
                    </li>
                </ul>
            </div>
        )
    }

    return (
        <nav className="z-20 font-nxt flex top-0 sticky h-20 bg-primary">
            
            <div className="flex justify-between pl-10 pr-10 h-full w-full">
                <Link passHref href="/" onClick={toggleHome}>
                    <div className="hidden ml-1 lg:pt-3 lg:flex lg:h-full lg:justify-center lg:items-center">
                        <Image className={"cursor-pointer"} src={logo} width={'200'} height={'40'} alt={'logo'}/>
                    </div>
                </Link>

                <div onClick={props.toggle} className="z-index-20 flex items-center justify-center h-full lg:hidden">
                    <MenuAlt3Icon className="text-white cursor-pointer h-8 "/>
                </div>

                <div className="z-index-20 flex items-center justify-center h-full lg:hidden">
                    {languageBox()}
                </div>

                
                <ul className={"lg:flex lg:h-full lg:list-none lg:text-center hidden text-white"}>
                    <li className="flex justify-center items-center h-full">
                        <LinkS  to='howitworks'
                                smooth={true}
                                duration={500}
                                spy={true}
                                exact="true"
                                offset={-80}
                                className="cursor-pointer mr-10 hover:text-secondary font-medium transition ease-in-out duration-300">
                                {t('home:nav:how')}
                        </LinkS>
                    </li>
                    <li className="flex justify-center items-center h-full">
                        <LinkS  to='products'
                                smooth={true}
                                duration={500}
                                spy={true}
                                exact="true"
                                offset={-80}
                                className="cursor-pointer active:border-b-2 active:border-green-300 mr-10 hover:text-secondary font-medium transition ease-in-out duration-300 ">
                                {t('home:nav:prod')}
                        </LinkS>
                    </li>
                    <li className="flex justify-center items-center h-full">
                        <LinkS  to='contact'
                                smooth={true}
                                duration={500}
                                spy={true}
                                exact="true"
                                offset={-80}
                                className="cursor-pointer active:border-b-2 active:border-green-300 mr-10 hover:text-secondary font-medium transition ease-in-out duration-300 ">
                                {t('home:nav:contact')}
                        </LinkS>
                    </li>
                    <li className="flex justify-center items-center h-full">
                        <Link passHref href={user ? `/dashboard/?user=${email}`:"/sign"}>
                            <div className= "group cursor-pointer mr-10 rounded-xl bg-secondary px-8 py-4 hover:bg-secondaryHover text-white font-extrabold transition ease-in-out duration-300">
                                {user ? t('home:nav:gotodash') : t('home:nav:sign')} &nbsp; <div className="absolute hidden group-hover:inline ">&rarr;</div>
                            </div>
                        </Link>
                    </li>

                    <li className="flex justify-center items-center h-full">
                        {languageBox()}
                    </li>

                </ul>

            </div>

        </nav>
    )
}

export default Nav
