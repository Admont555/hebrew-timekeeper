import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Quote {
  content: string;
  author: string | null;
}

const RandomQuote = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomQuote = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from("quotes")
        .select("content, author")
        .limit(1)
        .order('id', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      if (data && data.length > 0) {
        setQuote(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote');
      console.error('Error fetching quote:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomQuote();
    const interval = setInterval(fetchRandomQuote, 30000); // Changed to 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {!isLoading && quote && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-4 sm:mb-6 mx-3 sm:mx-auto max-w-2xl text-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-50/60 to-blue-50/60 dark:from-gray-800/40 dark:to-gray-700/40 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm"
          style={{
            WebkitBackdropFilter: "blur(8px)",
            transform: "translate3d(0,0,0)",
            WebkitTransform: "translate3d(0,0,0)",
            perspective: "1000px",
            WebkitPerspective: "1000px"
          }}
        >
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-base sm:text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed tracking-wide"
            style={{ direction: "rtl", WebkitFontSmoothing: "antialiased" }}
          >
            "{quote.content}"
          </motion.p>
          {quote.author && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-normal"
              style={{ direction: "rtl", WebkitFontSmoothing: "antialiased" }}
            >
              - {quote.author}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RandomQuote;