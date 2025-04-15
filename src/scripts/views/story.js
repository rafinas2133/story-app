import { showFormattedDate } from "../utils";
import { Loading } from "../components/Loading";
import { showAlert} from "../components/Alert";
import L from 'leaflet';

export const StoryView = {
  renderSkeleton(count = 10) {
    return Array.from({ length: count })
      .map(
        () => `
          <div class="skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton-details">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text"></div>
            </div>
            <div class="skeleton skeleton-map"></div>
          </div>
        `
      )
      .join('');
  },

  renderStories(stories) {
    return stories
      .map(
        (story) => `
          <div class="story-card">
            <img class="story-card__image" src="${story.photoUrl}" alt="${story.name}'s story" />
            <div class="story-card__details">
              <h3 class="story-card__title">${story.name}</h3>
              <p class="story-card__description">${story.description}</p>
              <small class="story-card__date">Posted at: ${showFormattedDate(story.createdAt)}</small>
            </div>
            <div class="story-card__map" id="map-${story.id}"></div>
          </div>
        `
      )
      .join('');
  },

  initializeMaps(listStory) {
    listStory.forEach((story) => {
      const map = L.map(`map-${story.id}`).setView([story.lat, story.lon], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
      L.marker([story.lat, story.lon])
        .addTo(map)
        .bindPopup(`<strong>${story.name}</strong><br>${story.description}`);
    });
  },

  renderError(message) {
    return `
      <div class="error-message">
        <p>${message}</p>
      </div>
    `;
  },

  renderLoading() {
    return this.renderSkeleton();
  },
};



export const AddStoryView = {
  renderForm() {
    return `
      <div class="add-story-form">
        <form id="add-story-form">
          <div>
            <label for="description">Description:</label>
            <textarea id="description" name="description" style="padding: 10px;" required></textarea>
          </div>

          <div>
            <label>Choose Photo Input Method:</label>
            <div id="photoInputOptions">
              <div>
                <input type="radio" id="uploadOption" name="photoInputMethod" value="upload" checked />
                <label for="uploadOption">Upload Photo</label>
              </div>
              <div>
                <input type="radio" id="captureOption" name="photoInputMethod" value="capture" />
                <label for="captureOption">Capture Photo</label>
              </div>
            </div>
          </div>

          <div id="uploadPhotoSection">
            <label for="photo">Upload Photo:</label>
            <input type="file" id="photo" name="photo" accept="image/*" />
            <img id="uploadPreview" src="" alt="Preview" style="display:none; max-width: 100%; margin-top: 10px;" />
          </div>

          <div id="capturePhotoSection" style="display: none;">
            <button type="button" id="capturePhotoButton">Capture Photo</button>
            <video id="cameraStream" autoplay hidden></video>
            <canvas id="cameraCanvas" hidden></canvas>
            <button type="button" id="savePhotoButton" hidden>Save Photo</button>
            <img id="capturePreview" src="" alt="Captured Preview" style="display:none; max-width: 100%; margin-top: 10px;" />
          </div>

          <div id="map-container" style="height: 300px;"></div>
          <div>
            <label for="latitude">Latitude:</label>
            <input type="text" id="latitude" name="lat" readonly />
          </div>
          <div>
            <label for="longitude">Longitude:</label>
            <input type="text" id="longitude" name="lon" readonly />
          </div>
          <button type="submit">Add Story</button>
        </form>
      </div>
    `;
  },
  renderLoading() {
    return Loading.show('Adding Story...');
  },
  renderSuccess(message) {
    return (
      Loading.hide(),
      showAlert({
        title: 'Story Added',
        text: message,
        icon: 'success',
        onConfirm: () => {
          window.location.hash = '/';
          location.reload();
        }
      })
    );
  },
  renderError(error) {
    return showAlert({
      title: 'Menambahkan Story Gagal',
      text: error,
      icon: 'error',
      onConfirm: () => {
        location.reload();
      }
    });
  },
};

  