import { combineReducers } from 'redux';

import { authentication } from './authentication.reducer';
import { registration } from './registration.reducer';
import { alert } from './alert.reducer';
import { districts } from './districts.reducer';

const rootReducer = combineReducers({
  authentication,
  registration,
  alert,
  districts
});

export default rootReducer;