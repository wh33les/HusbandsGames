// config.js
const config = {
    API_URL: process.env.NODE_ENV === 'production'
        ? 'https://husbands-games.org/api'  // Production URL
        : 'http://localhost:8000'           // Local development URL
};

export default config;