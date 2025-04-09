
import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer 
      className="w-full py-3 px-6 flex justify-center items-center border-t border-gray-100 dark:border-gray-800/30 mt-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex items-center justify-center gap-1 text-xs text-gray-400 dark:text-gray-500">
        <span>Made by</span>
        <a 
          href="https://beeu.co.il" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
        >
          BeeU
        </a>
      </div>
    </motion.footer>
  );
};

export default Footer;
