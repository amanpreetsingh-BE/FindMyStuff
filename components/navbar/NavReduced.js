import React from "react";
import Image from "next/image";
import Link from "next/link";

function NavReduced({ darkLogo }) {
  const logo_white = require("@images/icons/logo_white.svg");
  const logo_blk = require("@images/icons/logo_blk.svg");
  return (
    <nav className="z-20 font-nxt flex top-0 h-20 bg-transparent">
      <div className="flex justify-between px-10 h-full w-full">
        <Link passHref href="/">
          <div>
            <div className="hidden md:pt-3 md:h-full md:flex md:justify-center md:items-center">
              <Image
                className={"cursor-pointer"}
                src={darkLogo ? logo_blk : logo_white}
                width={"200"}
                height={"40"}
                alt={"logo"}
              />
            </div>
            <div className="md:hidden -ml-3 pt-3 h-full flex justify-center items-center">
              <Image
                className={"cursor-pointer"}
                src={darkLogo ? logo_blk : logo_white}
                width={"150"}
                height={"30"}
                alt={"logo"}
              />
            </div>
          </div>
        </Link>
      </div>
    </nav>
  );
}

export default NavReduced;
