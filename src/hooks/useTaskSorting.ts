import { useMemo } from 'react';
import { Task, TasksByDate } from '@/types/task';

export const useTaskSorting = (tasks: TasksByDate) => {
  const sortedDates = useMemo(
    () => Object.keys(tasks).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
    [tasks]
  );

  const getRemainingTime = (task: Task) => {
    if (!task.startTime || task.completed) return Infinity;
    const start = new Date(task.startTime).getTime();
    const now = new Date().getTime();
    const elapsedSeconds = Math.floor((now - start) / 1000);
    return task.duration * 60 - elapsedSeconds;
  };

  const sortTasks = (tasksArray: Task[]) => {
    return [...tasksArray].sort((a, b) => {
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

  return { sortedDates, sortTasks };
};