import { userConstants } from '../_constants';
import { userService } from '../_services';
import { districtsActions } from './districts.actions';
import { adminActions } from './admin.actions';

function login(username, password) {
    return dispatch => {
        dispatch(request({ username }));
        userService.login(username, password)
            .then(
                user => { 
                    dispatch(success(user, username));
                    dispatch(adminActions.refresh(username))
                    dispatch(districtsActions.refresh());
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request(user, username) { return { type: userConstants.LOGIN_REQUEST, user, username } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
    return dispatch => {
        userService.logout();
        dispatch(adminActions.clear())
        dispatch(lgt())
    }

    function lgt() { return { type: userConstants.LOGOUT } }
}

function register(user) {
    return dispatch => {
        dispatch(request(user));
        userService.register(user)
            .then(
                user => { 
                    dispatch(success());
                    window.location.href = '/login';
                },
                error => {
                    dispatch(failure(error.toString()));
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