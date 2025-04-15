class NotFoundPage {
    render() {
      const containerStyle = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
        font-family: Arial, sans-serif;
      `;
  
      return `
        <div style="${containerStyle}">
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for does not exist.</p>
          <button onclick="history.back()">Go Back</button>
        </div>
      `;
    }
  }
  
  export default NotFoundPage;
  