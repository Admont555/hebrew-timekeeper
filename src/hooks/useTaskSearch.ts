import { useState, useMemo } from 'react';
import { TasksByDate } from '@/types/task';

export const useTaskSearch = (tasks: TasksByDate) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) return tasks;

    const filtered: TasksByDate = {};
    Object.entries(tasks).forEach(([date, dateTasks]) => {
      const matchingTasks = dateTasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingTasks.length > 0) {
        filtered[date] = matchingTasks;
      }
    });
    return filtered;
  }, [tasks, searchTerm]);

  return { searchTerm, setSearchTerm, filteredTasks };
};