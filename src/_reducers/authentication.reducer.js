import { userConstants } from '../_constants';

let user = JSON.parse(localStorage.getItem('user'));
const initialState = user ? { loggedIn: true, user } : {};

export function authentication(state = initialState, action) {
  switch (action.type) {
    case userConstants.LOGIN_REQUEST:
      console.log('reducer: authentication login request');
      return {
        loggingIn: true,
        user: action.user
      };
    case userConstants.LOGIN_SUCCESS:
      console.log('reducer: authentication login success');
      return {
        loggedIn: true,
        user: action.user
      };
    case userConstants.LOGIN_FAILURE:
    console.log('reducer: authentication login failure');
      return {};
    case userConstants.LOGOUT:
    console.log('reducer: authentication login logout');
      return {};
    default:
      return state
  }
}