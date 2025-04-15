import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

export async function register(name, email, password) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });
  return await response.json();
}

export async function login(email, password) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
}

export async function getStories(token, location = 1) {
  const url = `${ENDPOINTS.STORIES}?location=${location}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}

export const addStory = async (token, formData) => {
  const response = await fetch(ENDPOINTS.STORIES, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData, 
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to add story');
  }
  return result;
};

export async function getStoryDetail(token, storyId) {
  const response = await fetch(ENDPOINTS.STORY_DETAIL(storyId), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}

export async function subscribe(token, subscription) {
  const response = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subscription),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to subscribe');
  }
  return result;
}

export async function unsubscribe(token, endpoint) {
  const response = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint }),
  });
  return await response.json();
}

export function sendStoryNotification(description) {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications.');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification('Story berhasil dibuat', {
      body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification('Story berhasil dibuat', {
          body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
        });
      }
    });
  }
}
