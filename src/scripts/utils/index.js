export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export const useLocalStorage = (key) => {
  const setItem = (value) => {
      try {
          window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
          console.log(error);
      }
  };

  const getItem = () => {
      try {
          const item = window.localStorage.getItem(key);
          return item ? JSON.parse(item) : undefined;
      } catch (error) {
          console.log(error);
      }
  };

  const removeItem = () => {
      try {
          window.localStorage.removeItem(key);
      } catch (error) {
          console.log(error);
      }
  };

  return {
      setItem,
      getItem,
      removeItem,
  };
};

export function startViewTransition(callback) {
  if (document.startViewTransition) {
    document.startViewTransition(callback);
  } else {
    callback();
  }
}

export function renderWithTransition(callback, elementSelector) {
  const container = document.querySelector(elementSelector);

  if (!container) {
    console.error(`Element with selector "${elementSelector}" not found.`);
    return;
  }

  startViewTransition(() => {
    callback(container);
  });
}


  