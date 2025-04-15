
const DB_NAME = 'story-app-db';
const DB_VERSION = 1;
const STORY_STORE_NAME = 'stories';

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORY_STORE_NAME)) {
        const storyStore = db.createObjectStore(STORY_STORE_NAME, { keyPath: 'id' });
        
        storyStore.createIndex('id', 'id', { unique: true });
        storyStore.createIndex('createdAt', 'createdAt', { unique: false });
        
      }
    };
  });
};

export const saveStories = async (stories) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not initialized');
      return;
    }

    const transaction = db.transaction(STORY_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORY_STORE_NAME);

    const clearRequest = store.clear();

    clearRequest.onsuccess = () => {
      
      let successCount = 0;
      stories.forEach((story) => {
        const request = store.add(story);
        
        request.onsuccess = () => {
          successCount++;
          if (successCount === stories.length) {
            resolve(true);
          }
        };
        
        request.onerror = (event) => {
          console.error('Error saving story:', event.target.error);
        };
      });
    };

    clearRequest.onerror = (event) => {
      console.error('Error clearing stories:', event.target.error);
      reject('Failed to clear previous stories');
    };

    transaction.oncomplete = () => {
      console.log('All stories saved successfully');
    };

    transaction.onerror = (event) => {
      console.error('Transaction error:', event.target.error);
      reject('Transaction failed');
    };
  });
};

export const getAllStories = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not initialized');
      return;
    }

    const transaction = db.transaction(STORY_STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORY_STORE_NAME);
    
    const index = store.index('createdAt');
    const request = index.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error('Error getting stories:', event.target.error);
      reject('Failed to get stories');
    };
  });
};

export const clearAllData = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      try {
        initDB().then(database => {
          db = database;
          clearData();
        }).catch(err => {
          reject(err);
        });
      } catch (error) {
        reject('Database not initialized and could not be initialized');
      }
      return;
    }
    
    clearData();
    
    function clearData() {
      const transaction = db.transaction(STORY_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORY_STORE_NAME);
      
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log('All stories cleared on logout');
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error clearing all stories:', event.target.error);
        reject('Failed to clear all stories');
      };
    }
  });
};

export const hasStories = async () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not initialized');
      return;
    }

    const transaction = db.transaction(STORY_STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORY_STORE_NAME);
    const countRequest = store.count();

    countRequest.onsuccess = () => {
      resolve(countRequest.result > 0);
    };

    countRequest.onerror = (event) => {
      console.error('Error counting stories:', event.target.error);
      reject('Failed to count stories');
    };
  });
};