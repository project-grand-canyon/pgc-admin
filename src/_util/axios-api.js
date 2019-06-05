import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://project-grand-canyon.appspot.com/api/'
    // baseURL: 'http://localhost:8080/api/'
});

export default instance;