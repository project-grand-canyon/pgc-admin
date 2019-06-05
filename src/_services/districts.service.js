import axios from '../_util/axios-api';
import { authHeader } from '../_util/auth/auth-header';

export const districtsService = {
    refresh
};

function refresh() {
    const requestOptions = {
        url: '/districts',
        method: 'GET',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
    };
    return axios(requestOptions).then((response)=>{
            localStorage.setItem('districts', response.data)
            return response.data;
        }).catch(handleBadResponse)
}

function handleBadResponse(error) {
    if (error.response.status >= 400) {
        const error = error.response.data || error.response.statusText;
        return Promise.reject(error)
    }
    return Promise.resolve(error.response);

}