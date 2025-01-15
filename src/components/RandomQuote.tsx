import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      .order('random()');

    if (!error && data.length > 0) {
      setQuote(data[0]);
    }
  };

  useEffect(() => {
    fetchRandomQuote();
    const interval = setInterval(fetchRandomQuote, 60000); // Change quote every minute
    return () => clearInterval(interval);
  }, []);

  if (!quote) return null;

  return (
    <div className="mb-8 text-center p-4 bg-purple-50 dark:bg-gray-800 rounded-lg">
      <p className="text-lg italic text-gray-700 dark:text-gray-300">"{quote.content}"</p>
      {quote.author && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">- {quote.author}</p>
      )}
    </div>
  );
};

export default RandomQuote;