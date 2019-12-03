import { districtsConstants } from '../_constants';

const initialState = { districts: [] };
  
export function districts(state = initialState, action) {
	switch (action.type) {
		case districtsConstants.REQUEST:
		  return {
				districts: [],
				selected: null,
				refreshing: true
			};
		case districtsConstants.SUCCESS:
		  return {
				districts: action.districts,
				refreshed: true
			};
		case districtsConstants.FAILURE:
			return {
				error: action.error
			};
		case districtsConstants.SELECT:
			return {
				...state,
				districts: [...state.districts],
				selected: action.district
			};
		default:
		  return state
	  }
};