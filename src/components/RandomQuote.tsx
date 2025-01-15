import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Quote {
  content: string;
  author: string | null;
}

const RandomQuote = () => {
  const [quote, setQuote] = useState<Quote | null>(null);

  const fetchRandomQuote = async () => {
    const { data, error } = await supabase
      .from("quotes")
      .select("content, author")
      .limit(1)
      .order('id', { ascending: false });

    if (!error && data.length > 0) {
      setQuote(data[0]);
    }
  };

  useEffect(() => {
    fetchRandomQuote();
    const interval = setInterval(fetchRandomQuote, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!quote) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 text-center p-8 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
    >
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-2xl font-serif text-gray-800 dark:text-gray-200 leading-relaxed"
        style={{ direction: "rtl" }}
      >
        "{quote.content}"
      </motion.p>
      {quote.author && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium"
          style={{ direction: "rtl" }}
        >
          - {quote.author}
        </motion.p>
      )}
    </motion.div>
  );
};

export default RandomQuote;