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
            const token = response.data.accessToken;
            const expiration = Date.now() + (1000 * response.data.expiresIn);
            localStorage.setItem('user', token);
            localStorage.setItem('username', username);
            localStorage.setItem('expires', expiration.toString());
        }).catch(handleBadResponse)
}

function logout() {
    // remove user from local storage to log user out
    console.log('logsout')
    localStorage.removeItem('user');
    localStorage.removeItem('username')
    localStorage.removeItem('expires')
}

function handleBadResponse(error) {
    if (!error.response) {
        return Promise.reject(error)
    }
    if (error.response.status === 401) {
        logout();
        return Promise.reject(new Error('Wrong username/password'))
    }
    if (error.response.status >= 400) {
        return Promise.reject(error.response.data || error.response.statusText)
    }
    return Promise.resolve(error.response);
}
