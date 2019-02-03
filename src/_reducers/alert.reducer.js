import { alertConstants } from '../_constants';

export function alert(state = {}, action) {
  switch (action.type) {
    case alertConstants.SUCCESS:
      console.log('reducer: alert success');
      return {
        type: 'alert-success',
        message: action.message
      };
    case alertConstants.ERROR:
    console.log('reducer: alert error');
      return {
        type: 'alert-danger',
        message: action.message
      };
    case alertConstants.CLEAR:
    console.log('reducer: alert clear');
      return {};
    default:
      return state
  }
}