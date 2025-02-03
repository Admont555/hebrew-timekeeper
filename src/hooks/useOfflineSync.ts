import { useEffect, useCallback } from 'react';
import { saveTaskOffline, getOfflineTasks, deleteOfflineTask } from '@/utils/indexedDB';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/task';

// Extend ServiceWorkerRegistration to include sync
declare global {
  interface ServiceWorkerRegistration {
    sync: {
      register(tag: string): Promise<void>;
    };
  }
}

interface OfflineTask extends Task {
  sync_status: 'pending' | 'synced';
  offline_id: string;
}

export function useOfflineSync() {
  const { toast } = useToast();
  const isOnline = navigator.onLine;

  const syncTasks = useCallback(async () => {
    if (!isOnline) return;

    try {
      const offlineTasks = await getOfflineTasks() as OfflineTask[];
      if (offlineTasks.length > 0) {
        // Request sync
        if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-tasks');
        }
      }
    } catch (error) {
      console.error('Error syncing tasks:', error);
      toast({
        title: "שגיאה בסנכרון משימות",
        description: "לא הצלחנו לסנכרן את המשימות שלך. נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    }
  }, [isOnline, toast]);

  const saveTask = useCallback(async (task: Task) => {
    if (!isOnline) {
      const offlineTask: OfflineTask = {
        ...task,
        sync_status: 'pending',
        offline_id: crypto.randomUUID(),
      };
      await saveTaskOffline(offlineTask);
      toast({
        title: "משימה נשמרה במצב לא מקוון",
        description: "המשימה תסונכרן כאשר יהיה חיבור לאינטרנט.",
      });
    }
    return task;
  }, [isOnline, toast]);

  useEffect(() => {
    window.addEventListener('online', syncTasks);
    return () => window.removeEventListener('online', syncTasks);
  }, [syncTasks]);

  return {
    isOnline,
    saveTask,
    syncTasks,
  };
}