
import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer 
      className="w-full py-4 px-6 flex justify-center items-center border-t border-gray-200 dark:border-gray-800 mt-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>Made by</span>
        <a 
          href="https://beeu.co.il" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <img 
            src="https://beeu.co.il/wp-content/uploads/2024/03/Vector.svg" 
            alt="BeeU Logo" 
            className="h-5 w-auto mr-1" 
          />
          <span>BeeU</span>
        </a>
      </div>
    </motion.footer>
  );
};

export default Footer;
