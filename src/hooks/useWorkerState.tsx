import { useState, useEffect } from 'react';

interface WorkerNames {
  [key: string]: string;
}

export const useWorkerState = () => {
  const [currentWorker, setCurrentWorker] = useState<string>('worker1');
  const [workerNames, setWorkerNames] = useState<WorkerNames>(() => {
    const saved = localStorage.getItem('workerNames');
    return saved ? JSON.parse(saved) : { worker1: 'עובד 1', worker2: 'עובד 2' };
  });

  useEffect(() => {
    localStorage.setItem('workerNames', JSON.stringify(workerNames));
  }, [workerNames]);

  const handleWorkerNameChange = (workerId: string, newName: string) => {
    setWorkerNames(prev => ({
      ...prev,
      [workerId]: newName
    }));
  };

  return {
    currentWorker,
    setCurrentWorker,
    workerNames,
    handleWorkerNameChange,
  };
};