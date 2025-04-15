import { subscribe } from "../data/api";
import { useLocalStorage } from ".";

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function requestPushSubscription(token) {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    alert('Push Notification tidak didukung di browser Anda.');
    return;
  }

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission !== 'granted') {
    alert('Anda harus mengizinkan notifikasi untuk menggunakan fitur ini.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const subscriptionJSON = JSON.parse(JSON.stringify(subscription));

    const { endpoint, keys } = subscriptionJSON;
    const subscriptionData = { endpoint, keys };
    
    const response = await subscribe(token, subscriptionData);
    const {setItem} = useLocalStorage('endpoint');
    setItem(subscriptionData.endpoint);
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
  }
}
