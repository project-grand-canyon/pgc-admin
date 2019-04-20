import axios from '../_util/axios-api';
import { authHeader } from '../_util/auth/auth-header';

export const districtsService = {
    refresh
};

function refresh() {
    console.log(`districts service: refresh`);
    const requestOptions = {
        url: '/districts',
        method: 'GET',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
    };
    return axios(requestOptions).then((response)=>{
            console.log('districts service: getAll - got response');
            console.log(response);
            localStorage.setItem('districts', response.data)
            return response.data;
        }).catch(handleBadResponse)
}

function handleBadResponse(error) {
    console.log(`districts repsonse: ${error.response.status}-${error.response.statusText}`);
    console.log('districts service: handle bad response');
    if (error.response.status >= 400) {
        const error = error.response.data || error.response.statusText;
        return Promise.reject(error)
    }
    return Promise.resolve(error.response);

}