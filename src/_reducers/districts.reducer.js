import { districtsConstants } from '../_constants';

const initialState = { districts: [] };
  
export function districts(state = initialState, action) {
	switch (action.type) {
		case districtsConstants.REQUEST:
		  return {
				districts: [],
				districtsBySlug: new Map(),
				refreshing: true
			};
		case districtsConstants.SUCCESS:
		  return {
				districts: action.districts,
				districtsBySlug: action.districtsBySlug,
				refreshed: true
			};
		case districtsConstants.FAILURE:
			return {
				error: action.error
			};
		default:
		  return state
	  }
};