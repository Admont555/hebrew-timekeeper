const CACHE_NAME = 'task-tracker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Sync event - handle background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

// Function to get tasks from IndexedDB
async function getOfflineTasks() {
  const db = await openDB();
  const store = db.transaction('tasks', 'readonly').objectStore('tasks');
  return store.getAll();
}

// Function to sync a single task
async function syncTask(task) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (response.ok) {
    const db = await openDB();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    await store.delete(task.id);
    await tx.complete;
  }
}

// Function to sync all offline tasks
async function syncTasks() {
  try {
    const tasks = await getOfflineTasks();
    for (const task of tasks) {
      await syncTask(task);
    }
  } catch (error) {
    console.error('Error syncing tasks:', error);
  }
}

// IndexedDB setup
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TaskTrackerDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    };
  });
}