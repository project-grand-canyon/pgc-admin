import axios from '../_util/axios-api';
import { authHeader } from '../_util/auth/auth-header';
import { slug } from '../_util/district';

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
            const districts = response.data;
            const districtsBySlug = new Map(districts.map((dist) => [slug(dist), dist]));
            return { districts, districtsBySlug };
        }).catch(handleBadResponse)
}

function handleBadResponse(error) {
    if (error.response.status >= 400) {
        return Promise.reject(error.response.data || error.response.statusText)
    }
    return Promise.resolve(error.response);

}
