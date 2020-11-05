import { createStore } from 'redux';
import { rootReducer } from './reducers';

const {
  /* Where the fleet list can be found. */
  FLEET_HOST,
} = window.config;

const INITIAL_STATE = {
  apps: [],
  fleetList: [],
  ip: FLEET_HOST,
  bottomBarText: 'Ready',
  atticData: {
    app: '',
    key: '',
    value: '',
  },
  conduitData: {
    app: '',
    topic: 'status',
    message: '{}',
  },
  visualsData: {
    index: 0,
    red: 128,
    green: 128,
    blue: 128,
    text: '',
  },
};

const store = createStore(rootReducer, INITIAL_STATE);

export default store;
