import { getStories, addStory, sendStoryNotification, unsubscribe } from '../data/api';
import { StoryView, AddStoryView } from '../views/story';
import { useLocalStorage, renderWithTransition } from '../utils';
import { showAlert } from '../components/Alert';
import { requestPushSubscription } from '../utils/pushHelper';
import { initDB, saveStories, getAllStories, hasStories } from '../data/db.js';
import L from 'leaflet';

export const StoryPresenter = {
  async init() {
    const { getItem } = useLocalStorage('token');
    const { getItem: getItemSub, removeItem: removeItemSub } = useLocalStorage('endpoint');
    const token = getItem();

    // Inisialisasi IndexedDB
    await initDB().catch(error => {
      console.error('Failed to initialize IndexedDB:', error);
    });

    renderWithTransition(async (container) => {
      container.innerHTML = StoryView.renderLoading();

      try {
        if (!token) throw new Error('Not login yet, Please login first.');

        let listStory;
        let isOffline = false;

        try {
          // Coba ambil data dari API
          const response = await getStories(token);
          
          if (response.error) throw new Error(response.message);
          
          listStory = response.listStory;
          
          // Simpan data ke IndexedDB untuk penggunaan offline
          await saveStories(listStory);
        } catch (apiError) {
          console.error('API Error:', apiError);
          
          // Cek apakah ada data di IndexedDB
          const hasOfflineData = await hasStories();
          
          if (hasOfflineData) {
            isOffline = true;
            listStory = await getAllStories();
          } else {
            throw new Error('Tidak dapat mengambil data dan tidak ada data offline');
          }
        }

        // Render stories
        container.innerHTML = StoryView.renderStories(listStory, isOffline);
        document.querySelector('#story-container').style.height = '100%';
        
        // Initialize maps jika data berisi lokasi
        if (listStory.some(story => story.lat && story.lon)) {
          StoryView.initializeMaps(listStory);
        }

      } catch (error) {
        container.innerHTML = StoryView.renderError(error.message);
      }
    }, '#story-container');

    const subscribeButton = document.querySelector('#subscribe-button');
    const storedSubscription = getItemSub() ? (getItemSub()) : null;
    updateSubscribeButton(!!storedSubscription, subscribeButton);

    subscribeButton.addEventListener('click', async () => {
      if (!token) {
        showAlert({
          title: 'Subscribe Gagal',
          text: 'Silakan login terlebih dahulu.',
          icon: 'error',
        })
        return;
      }

      try {
        if (!storedSubscription && subscribeButton.textContent === 'Subscribe') {
          const subscription = await requestPushSubscription(token);
          showAlert({
            title: 'Subscribe Berhasil',
            text: 'Anda telah berlangganan push notification.',
            icon: 'success',
          })
          updateSubscribeButton(true, subscribeButton);
        } else {
          const response = await unsubscribe(token, getItemSub());

          if (!response.error) {
            removeItemSub();
            showAlert({
              title: 'Unsubscribe Berhasil',
              text: 'Anda telah berhenti berlangganan push notification.',
              icon: 'success',
            })
            updateSubscribeButton(false, subscribeButton);
          } else {
            throw new Error(response.message);
          }
        }
      } catch (error) {
        console.error('Failed to update subscription status:', error);
        alert(`Gagal memperbarui status: ${error.message}`);
      }
    });
  },
};

function updateSubscribeButton(isSubscribed, button) {
  button.textContent = isSubscribed ? 'Unsubscribe' : 'Subscribe';
}

export const AddStoryPresenter = {
  async init() {
    const container = document.querySelector('#add-story-container');
    container.innerHTML = AddStoryView.renderForm();

    const map = L.map('map-container').setView([0, 0], 2);

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
    
    const mapTilerLayer = L.tileLayer(
      'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=ROg7u0JF5szRdvfW0dYC',
      {
        maxZoom: 19,
        attribution: 'Map data © MapTiler contributors',
      }
    );
    
    const baseLayers = {
      'Street Map': osmLayer,
      'MapTiler Streets': mapTilerLayer,
    };

    L.control.layers(baseLayers).addTo(map);
    osmLayer.addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13);
        },
        (error) => {
          console.warn('Geolocation permission denied or unavailable. Using default position.');
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
    }

    let selectedLat = null;
    let selectedLon = null;
    let currentMarker = null; 

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      selectedLat = lat;
      selectedLon = lng;

      document.querySelector('#latitude').value = lat;
      document.querySelector('#longitude').value = lng;

      if (currentMarker) {
        map.removeLayer(currentMarker);
      }

      currentMarker = L.marker([lat, lng]).addTo(map);
    });

    const form = document.querySelector('#add-story-form');

    const uploadOption = document.getElementById('uploadOption');
    const captureOption = document.getElementById('captureOption');
    const uploadPhotoSection = document.getElementById('uploadPhotoSection');
    const capturePhotoSection = document.getElementById('capturePhotoSection');
    const photoInput = document.getElementById('photo');
    const uploadPreview = document.getElementById('uploadPreview');
    const capturePreview = document.getElementById('capturePreview');
    const capturePhotoButton = document.getElementById('capturePhotoButton');
    const cameraStream = document.getElementById('cameraStream');
    const cameraCanvas = document.getElementById('cameraCanvas');
    const savePhotoButton = document.getElementById('savePhotoButton');

    let stream;
    let capturedImage;

    uploadOption.addEventListener('change', () => {
      uploadPhotoSection.style.display = 'block';
      capturePhotoSection.style.display = 'none';
      clearCapturedPhoto()
    });

    captureOption.addEventListener('change', () => {
      uploadPhotoSection.style.display = 'none';
      capturePhotoSection.style.display = 'block';
      clearUploadPhoto();
    });

    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadPreview.src = event.target.result;
          uploadPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    capturePhotoButton.addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraStream.srcObject = stream;
        cameraStream.hidden = false;
        savePhotoButton.hidden = false;
        capturePhotoButton.hidden = true;
      } catch (error) {
        alert('Unable to access camera: ' + error.message);
      }
    });

    savePhotoButton.addEventListener('click', () => {
      const context = cameraCanvas.getContext('2d');
      cameraCanvas.width = cameraStream.videoWidth;
      cameraCanvas.height = cameraStream.videoHeight;
      context.drawImage(cameraStream, 0, 0, cameraCanvas.width, cameraCanvas.height);
      capturedImage = cameraCanvas.toDataURL('image/jpeg');
      capturePreview.src = capturedImage;
      capturePreview.style.display = 'block';
      stopCameraStream();
    });

    function stopCameraStream() {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }
      cameraStream.hidden = true;
      savePhotoButton.hidden = true;
      capturePhotoButton.hidden = false;
    }

    function clearUploadPhoto() {
      photoInput.value = ''; 
      uploadPreview.src = ''; 
      uploadPreview.style.display = 'none';
    }

    function clearCapturedPhoto() {
      capturedImage = null; 
      capturePreview.src = ''; 
      capturePreview.style.display = 'none';
    }
    

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const { getItem } = useLocalStorage('token');
      const token = getItem();

      if (!token) {
        container.innerHTML = AddStoryView.renderError('No token found. Please login.');
        return;
      }

      const formData = new FormData(form);

      for (let [key] of formData.entries()) {
        if (key.startsWith('leaflet-base-layers')) {
          formData.delete(key);
        }
      }

      const photoFile = formData.get('photo');
      if (photoFile && photoFile.size > 1024 * 1024) {
        showAlert({
          title: 'Image Size Too Large',
          text: 'Image size must be less than 1MB',
          icon: 'warning',
        });
        return;
      }

      if (capturedImage) {
        formData.delete('photo');
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        formData.append('photo', blob, 'captured-image.jpg');
      }

      formData.delete('lat');
      formData.delete('lon');
      formData.delete('photoInputMethod');

      if (selectedLat && selectedLon) {
        formData.append('lat', selectedLat);
        formData.append('lon', selectedLon);
      }

      container.innerHTML = AddStoryView.renderLoading();

      try {
        const response = await addStory(token, formData);
        container.innerHTML = AddStoryView.renderSuccess(response.message);
      } catch (error) {
        container.innerHTML = AddStoryView.renderError(error.message);
      }
    });
  },
};
