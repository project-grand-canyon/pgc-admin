export function authHeader() {
    // return authorization header with jwt token
    let user = localStorage.getItem('user');

    if (user) {
        return { 'Authorization': 'Bearer ' + user };
    } else {
        return {};
    }
}