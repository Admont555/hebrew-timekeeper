import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface TaskSearchProps {
  searchTerm: string;
  onSearch: (term: string) => void;
}

const TaskSearch = ({ searchTerm, onSearch }: TaskSearchProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-6"
    >
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="חפש משימות..."
          className="pl-4 pr-10 text-right bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-100 dark:border-gray-700"
          dir="rtl"
        />
      </div>
    </motion.div>
  );
};

export default TaskSearch;