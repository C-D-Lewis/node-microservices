import { createStore, combineReducers } from 'redux';

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
  ambienceData: {
    red: 128,
    green: 128,
    blue: 128,
  },
  visualsData: {
    index: 0,
    red: 128,
    green: 128,
    blue: 128,
    text: '',
  },
};

const buildReducer = (firstValue, subreducers) => (state = firstValue, action) =>
    subreducers[action.type]
      ? subreducers[action.type](state, action)
      : state;

const rootReducer = combineReducers({
  apps: buildReducer([], {
    SET_APPS: (state, action) => action.apps,
  }),
  fleetList: buildReducer([], {
    SET_FLEET_LIST: (state, action) => action.fleetList,
  }),
  ip: buildReducer('', {
    SET_IP: (state, action) => action.ip,
  }),
  bottomBarText: buildReducer('', {
    SET_BOTTOM_BAR_TEXT: (state, action) => action.bottomBarText,
  }),
  atticData: buildReducer({}, {
    SET_ATTIC_DATA: (state, action) => action.atticData,
  }),
  conduitData: buildReducer({}, {
    SET_CONDUIT_DATA: (state, action) => action.conduitData,
  }),
  ambienceData: buildReducer({}, {
    SET_AMBIENCE_DATA: (state, action) => action.ambienceData,
  }),
  visualsData: buildReducer({}, {
    SET_VISUALS_DATA: (state, action) => action.visualsData,
  }),
});

const store = createStore(rootReducer, INITIAL_STATE);

export default store;