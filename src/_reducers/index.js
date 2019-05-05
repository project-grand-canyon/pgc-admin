import { combineReducers } from 'redux';

import { authentication } from './authentication.reducer';
import { registration } from './registration.reducer';
import { districts } from './districts.reducer';
import { admin } from './admin.reducer';

const rootReducer = combineReducers({
  authentication,
  registration,
  admin,
  districts
});

export default rootReducer;