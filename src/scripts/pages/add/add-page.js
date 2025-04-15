import { AddStoryPresenter } from "../../presenters/story";

export default class AddPage {
  async render() {
    return `
      <h1>Add Story Page</h1>
      <section id="add-story-container" class="container">
        <h1>Add Story Page</h1>
      </section>
    `;
  }

  async afterRender() {
    await AddStoryPresenter.init();
  }
}
