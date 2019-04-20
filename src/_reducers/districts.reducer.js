import { districtsConstants } from '../_constants';

const initialState = { districts: [] };
  
export function districts(state = initialState, action) {
	switch (action.type) {
		case districtsConstants.REQUEST:
		  console.log('reducer: districts request');
		  return {
				districts: [],
				selected: null,
				refreshing: true
			};
		case districtsConstants.SUCCESS:
			console.log('reducer: districts success');
			console.log(action.districts);
		  return {
				districts: action.districts,
				selected: action.districts[0] || null,
				refreshed: true
			};
		case districtsConstants.FAILURE:
			console.log('reducer: districts failure');
			return {};
		case districtsConstants.SELECT:
			console.log('reducer: districts select');
			console.log(state);
			console.log(action);
			return {
				...state,
				districts: [...state.districts],
				selected: action.district
			};
		default:
		  return state
	  }
};