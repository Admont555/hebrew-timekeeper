import { motion } from "framer-motion";

const Header = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="flex flex-col items-center gap-3 mb-6"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-secondary to-card border border-border/60 shadow-lg shadow-primary/10">
        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" />
          <path d="M8 10L12 12L16 10" />
          <path d="M8 14L12 16L16 14" />
        </svg>
      </div>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight text-center mb-0">
        מעקב משימות
      </h1>
      <div className="h-1 w-20 rounded-full bg-secondary overflow-hidden">
        <div className="h-full w-1/3 bg-primary rounded-full" />
      </div>
    </motion.div>
  );
};

export default Header;
