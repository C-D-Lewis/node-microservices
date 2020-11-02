import { createStore } from 'redux';
import { rootReducer } from './reducers';

const INITIAL_STATE = {
  devices: [],
};

const store = createStore(rootReducer, INITIAL_STATE);

export default store;
