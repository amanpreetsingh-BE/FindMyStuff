/* Icons */
import {XIcon} from '@heroicons/react/outline'
/* Smooth scroll */
import {Link as LinkS} from 'react-scroll'

function MobileNav({useContext, UserContext, Image, Link, toggle, t, isOpen }) {

    const opacity = isOpen ? " opacity-0 " : " opacity-100 "
    const top = isOpen ? " top-full" : " -top-0 "

    const { user, email} = useContext(UserContext)
    const logo = require('@images/icons/logo_white.svg');

    return (
        <aside className={"z-40 font-nxt fixed bg-menuBg w-screen h-full grid items-center transition ease-in-out duration-300 left-0 text-white "+opacity+top}>
            <div onClick={toggle} className="absolute top-8 right-8 w-8 h-8 cursor-pointer outline-none">
                <XIcon className="text-3xl text-red-400 hover:text-red-500 transition ease-in-out duration-300 "/>
            </div>
            <div className="flex flex-col space-y-36">
                <Link passHref href="/" >
                    <div onClick={toggle} className="flex h-full justify-center items-center">
                        <Image className={"cursor-pointer"} src={logo} width={'200'} height={'40'} alt={'logo'}/>
                    </div>
                </Link>

                <ul className="grid text-center grid-cols-1 grid-rows-3 gap-4">
                    <LinkS  to='howitworks'
                            onClick={toggle}
                            smooth={true}
                            duration={500}
                            spy={true}
                            exact="true"
                            offset={-96}
                            className="flex items-center justify-center text-lg font-medium cursor-pointer transition ease-in-out duration-300">
                            {t('home:nav:how')}
                    </LinkS>
                    <LinkS  to='products'
                            onClick={toggle}
                            smooth={true}
                            duration={500}
                            spy={true}
                            exact="true"
                            offset={-96}
                            className="flex items-center justify-center text-lg font-medium cursor-pointer transition ease-in-out duration-300">
                            {t('home:nav:prod')}
                    </LinkS>
                    <LinkS  to='contact'
                            onClick={toggle}
                            smooth={true}
                            duration={500}
                            spy={true}
                            exact="true"
                            offset={-96}
                            className="flex items-center justify-center text-lg font-medium cursor-pointer transition ease-in-out duration-300">
                            {t('home:nav:contact')}
                    </LinkS>
                </ul>
                <div className="flex justify-center">
                    <Link passHref href={user ? `/dashboard/?user=${email}`:"/sign"}>
                        <div className= "transition ease-in-out duration-300  cursor-pointer font-semibold rounded-xl bg-secondary px-8 py-4 hover:bg-secondaryHover ">
                            {user ? t('home:nav:gotodash') : t('home:nav:sign')} &nbsp; &rarr;
                        </div>
                    </Link>
                </div>
            </div>
        </aside>
    )
}

export default MobileNav
