import axios from '../_util/axios-api';
import { authHeader } from '../_util/auth/auth-header';


export const userService = {
    login,
    logout,
    register,
    update
};

function login(username, password) {
    console.log(`login service: login: ${username} ${password}`);
    const requestOptions = {
        url: '/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { 'userName': username, 'password': password }
    };
    return axios(requestOptions).then((response)=>{
            console.log('login service: login - got response');
            const token = response.data.accessToken;
            localStorage.setItem('user', JSON.stringify(token));
        }).catch(handleBadResponse)
}

function logout() {
    // remove user from local storage to log user out
    console.log('login service: logout');
    localStorage.removeItem('user');
}

function register(user) {
    const requestOptions = {
        url: '/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: user
    };

    return axios(requestOptions).catch(handleBadResponse);
}

function update(user) {
    const requestOptions = {
        url: '/update-user',
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        data: user
    };

    return axios(requestOptions).catch(handleBadResponse);
}

function handleBadResponse(error) {
    console.log(`login repsonse: ${error.response.status}`);
    console.log('login service: handle bad response');
    console.log('Hi');
    if (error.response.status === 401) {
        console.log('login service: handle bad response - call logout');
        logout();
        window.location.reload(true);
    }
    if (error.response.status > 400) {
        const error = error.response.data || error.response.statusText;
        return Promise.reject(error)
    }
    return Promise.resolve(error.response);

}