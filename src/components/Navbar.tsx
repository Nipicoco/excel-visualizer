import Image from "next/image";
import React, { useState, useEffect } from "react";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={`fixed top-0 bg-transparent z-[20] w-full flex justify-start gap-5 md:px-60 p-5 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <h1 className="text-white text-[45px]" dir="rtl" style={{ textAlign: 'right' }}>
      פרוייקט עדי 1
      <span className="text-red-500">.</span>
      </h1>
    </div>
  );
};

export default Navbar;