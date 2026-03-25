
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useIsMobile();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center ${isMobile ? 'mb-4' : 'mb-6'}`}
    >
      <img 
        src="https://beeu.co.il/wp-content/uploads/2024/03/אייקון-ביו-מקורי-1.svg" 
        alt="BeEu Logo" 
        className="w-12 h-12 sm:w-16 sm:h-16 mb-3 object-contain"
        loading="eager"
      />
      <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-bold text-gradient mb-0">
        מעקב משימות
      </h1>
    </motion.div>
  );
};

export default Header;
