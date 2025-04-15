import { StoryPresenter } from "../../presenters/story";

export default class HomePage {
  async render() {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h1>Home Page</h1>
        <button id="subscribe-button">Subscribe</button>
      </div>
      <section id="story-container" class="container">
      </section>
    `;
  }

  async afterRender() {
    await StoryPresenter.init();
  }

}
