import axios from '../_util/axios-api';

export const userService = {
    login,
    logout
};

function login(username, password) {
    const requestOptions = {
        url: '/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { 'userName': username, 'password': password }
    };
    return axios(requestOptions).then((response)=>{
            console.log('login service: login - got response');
            const token = response.data.accessToken;
            const expiration = Date.now() + (1000 * response.data.expiresIn);
            localStorage.setItem('user', token);
            localStorage.setItem('username', username);
            localStorage.setItem('expires', expiration.toString());
        }).catch(handleBadResponse)
}

function logout() {
    // remove user from local storage to log user out
    console.log('login service: logout');
    localStorage.removeItem('user');
    localStorage.removeItem('username')
}

function handleBadResponse(error) {
    console.log(error.message)
    if (!error.response) {
        console.log('blank')
        return Promise.reject(error)
    }
    if (error.response.status === 401) {
        logout();
        console.log('401')
        return Promise.reject(new Error('Unauthorized/Invalid Credentials'))
    }
    if (error.response.status >= 400) {
        console.log('other')
        return Promise.reject(error.response.data || error.response.statusText)
    }
    console.log('other other')
    return Promise.resolve(error.response);
}
