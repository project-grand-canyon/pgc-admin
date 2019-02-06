import { districtsConstants } from '../_constants';

const initialState = {
	districts: []
};
  
export function districts(state = initialState, action) {
	switch (action.type) {
		case districtsConstants.REQUEST:
		  console.log('reducer: districts request');
		  return {
				districts: [],
				refreshing: true
			};
			case districtsConstants.SUCCESS:
			console.log('reducer: districts success');
			console.log(action.districts);
		  return {
				districts: action.districts,
				refreshed: true
			};
			case districtsConstants.FAILURE:
		  console.log('reducer: districts failure');
		  return {};
		default:
		  return state
	  }
};