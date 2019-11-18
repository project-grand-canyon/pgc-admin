import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_ENDPOINT || 'https://project-grand-canyon.appspot.com/api/'
});

export default instance;