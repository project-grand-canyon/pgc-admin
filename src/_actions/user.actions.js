import { userConstants } from '../_constants';
import { userService } from '../_services';
import { alertActions } from '.';

function login(username, password) {
    console.log('user action login');
    return dispatch => {
        console.log('user action login dispatch login request');
        dispatch(request({ username }));
        console.log('user action login userservice login');
        userService.login(username, password)
            .then(
                user => { 
                    console.log('user action login dispatch success ');
                    dispatch(success(user));
                    window.location.href = '/dashboard';
                },
                error => {
                    console.log(JSON.stringify(error));
                    console.log('user action login dispatch failure');
                    dispatch(failure(error.toString()));
                    console.log('user action login dispatch alert action failure');
                    dispatch(alertActions.error(error.toString()));
                }
            );
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
    console.log('user action logout');
    userService.logout();
    return { type: userConstants.LOGOUT };
}

function register(user) {
    return dispatch => {
        dispatch(request(user));

        userService.register(user)
            .then(
                user => { 
                    dispatch(success());
                    window.location.href = '/login';
                    dispatch(alertActions.success('Registration successful'));
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
    };

    function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
    function success(user) { return { type: userConstants.REGISTER_SUCCESS, user } }
    function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }
}

const userActions = {
    login,
    logout,
    register
};

export { userActions as userActions };