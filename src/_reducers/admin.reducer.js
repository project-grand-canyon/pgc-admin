import { adminConstants } from '../_constants';

const initialState = {};
  
export function admin(state = initialState, action) {
	switch (action.type) {
		case adminConstants.CLEAR:
		  return {};
		case adminConstants.REQUEST:
		  return {
				admin: null,
				refreshing: true
			};
		case adminConstants.SUCCESS:
			console.log(action);
		  return {
				admin: action.admin,
				refreshed: true
			};
		case adminConstants.FAILURE:
			return {};
		default:
		  return state
	  }
};