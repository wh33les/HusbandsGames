// config.js
const config = {
    API_URL: process.env.NODE_ENV === 'production'
        ? 'https://husbands-games.org/api'  // Production URL
        : 'http://35.167.232.9:8000'           // Local development URL
    //API_URL: 'http://your-server:9999'  // Wrong port = connection error, for testing
};

export default config;