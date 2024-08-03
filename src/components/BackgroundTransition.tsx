import React from "react";
import { motion } from "framer-motion";

const BackgroundTransition = ({ isLightMode }: { isLightMode: boolean }) => {
  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-full z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundImage: isLightMode
          ? 'url("/assets/lightMode.jpg")'
          : 'url("/assets/nightMode.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
};

export default BackgroundTransition;