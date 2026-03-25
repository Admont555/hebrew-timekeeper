
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useIsMobile();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center mb-8 ${isMobile ? 'mt-16 pt-4 pb-2' : 'pt-20 sm:pt-24 md:pt-12 mt-2 sm:mt-4'}`}
    >
      <img 
        src="https://beeu.co.il/wp-content/uploads/2024/03/אייקון-ביו-מקורי-1.svg" 
        alt="BeEu Logo" 
        className="w-16 h-16 sm:w-24 sm:h-24 mb-4 object-contain"
        loading="eager"
      />
      <h1 
        className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 animate-gradient bg-clip-text text-transparent bg-[length:200%_auto] dark:from-purple-400 dark:via-blue-300 dark:to-purple-400"
      >
        מעקב משימות
      </h1>
      
    </motion.div>
  );
};

export default Header;
