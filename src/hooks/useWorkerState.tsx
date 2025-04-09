
import { useState, useEffect } from 'react';

interface WorkerNames {
  [key: string]: string;
}

export const useWorkerState = () => {
  const [currentWorker, setCurrentWorker] = useState<string>(() => {
    // Try to retrieve stored worker ID, or use default
    const savedWorkerId = localStorage.getItem('currentWorkerId');
    return savedWorkerId || 'worker1';
  });
  
  const [workerNames, setWorkerNames] = useState<WorkerNames>(() => {
    const saved = localStorage.getItem('workerNames');
    return saved ? JSON.parse(saved) : { worker1: 'עובד 1', worker2: 'עובד 2' };
  });

  // Store the current worker ID in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('currentWorkerId', currentWorker);
  }, [currentWorker]);

  useEffect(() => {
    localStorage.setItem('workerNames', JSON.stringify(workerNames));
  }, [workerNames]);

  const handleWorkerNameChange = (workerId: string, newName: string) => {
    setWorkerNames(prev => ({
      ...prev,
      [workerId]: newName
    }));
  };

  // Check if the current user has permission to edit a specific worker's data
  const hasEditPermission = (workerId: string) => {
    // Only allow editing if the current worker is viewing their own data
    return currentWorker === workerId;
  };

  return {
    currentWorker,
    setCurrentWorker,
    workerNames,
    handleWorkerNameChange,
    hasEditPermission,
  };
};
