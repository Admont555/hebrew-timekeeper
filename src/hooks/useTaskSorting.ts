import { useState } from 'react';
import { Task, TasksByDate } from '@/types/task';

type SortBy = 'date' | 'priority' | 'duration';

export const useTaskSorting = (tasks: TasksByDate) => {
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const sortedDates = Object.keys(tasks).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const getRemainingTime = (task: Task) => {
    if (!task.start_time || task.completed) return Infinity;
    const start = new Date(task.start_time).getTime();
    const now = new Date().getTime();
    const elapsedSeconds = Math.floor((now - start) / 1000);
    return task.duration * 60 - elapsedSeconds;
  };

  const sortTasks = (tasksArray: Task[]) => {
    return [...tasksArray].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
      }
      
      if (sortBy === 'duration') {
        return b.duration - a.duration;
      }

      // Default date-based sorting
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;

      if (!a.completed && !b.completed) {
        const aRemaining = getRemainingTime(a);
        const bRemaining = getRemainingTime(b);

        const aUnderOneMinute = aRemaining <= 60;
        const bUnderOneMinute = bRemaining <= 60;

        if (aUnderOneMinute && !bUnderOneMinute) return -1;
        if (!aUnderOneMinute && bUnderOneMinute) return 1;

        return aRemaining - bRemaining;
      }

      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  };

  const sortedTasks = Object.fromEntries(
    Object.entries(tasks).map(([date, dateTasks]) => [
      date,
      sortTasks(dateTasks)
    ])
  );

  return { sortedDates, sortTasks, sortedTasks, sortBy, setSortBy };
};