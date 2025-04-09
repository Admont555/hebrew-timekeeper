
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const superAdminEmail = 'adam@beeu.co.il';

  // Check if current user is the super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsSuperAdmin(session.user.email === superAdminEmail);
      }
    };
    
    checkSuperAdmin();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsSuperAdmin(session.user.email === superAdminEmail);
      } else {
        setIsSuperAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    // Super admin can edit everything
    if (isSuperAdmin) return true;
    
    // Only allow editing if the current worker is viewing their own data
    return currentWorker === workerId;
  };

  // Check if the current user can create new team members
  const canCreateTeamMembers = () => {
    return isSuperAdmin;
  };

  return {
    currentWorker,
    setCurrentWorker,
    workerNames,
    handleWorkerNameChange,
    hasEditPermission,
    isSuperAdmin,
    canCreateTeamMembers,
  };
};
