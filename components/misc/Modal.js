import { useRef, useEffect, useCallback } from 'react';
import { useSpring, animated } from 'react-spring';
import {XIcon} from '@heroicons/react/outline'


function Modal({ showModal, setShowModal, children }) {

    const modalRef = useRef();
    const animation = useSpring({
        config: {
          duration: 250
        },
        opacity: showModal ? 1 : 0,
        transform: showModal ? `translateY(0%)` : `translateY(-100%)`
      });

    const closeModal = e => {
        if (modalRef.current === e.target) {
            setShowModal(false);
        }
    };

    function handleClose(){
        setShowModal(prev => !prev);
    }

    const keyPress = useCallback(
        e => {
          if (e.key === 'Escape' && showModal) {
            setShowModal(false);
            console.log('I pressed');
          }
        },
        [setShowModal, showModal]
    );

    useEffect(
        () => {
          document.addEventListener('keydown', keyPress);
          return () => document.removeEventListener('keydown', keyPress);
        },
        [keyPress]
    );

    return(
        <>
            {showModal ? (
                <div className="w-full h-full bg-[rgba(0,0,0,0.8)] fixed left-0 top-0 flex justify-center items-center z-50" onClick={closeModal} ref={modalRef}>
                    <animated.div style={animation}>
                        <div className="w-[340px] h-[400px] sm:w-[460px] sm:h-[400px] md:w-[588px] md:h-[400px] shadow-md bg-white text-primary grid z-50 rounded-xl relative">
                            {children}
                            <div className="cursor-pointer absolute top-5 right-5 w-8 h-8 p-0 z-50" onClick={handleClose}>
                                <XIcon className="text-3xl text-red-600 hover:text-red-700 transition ease-in-out duration-300 "/>
                            </div>
                        </div>
                    </animated.div>
                </div>
            ) : null}
        </>
    )

}

export default Modal