import { combineReducers } from 'redux';

const buildReducer = (firstValue, subreducers) => (state = firstValue, action) =>
    subreducers[action.type]
      ? subreducers[action.type](state, action)
      : state;

export const rootReducer = combineReducers({
  apps: buildReducer([], {
    SET_APPS: (state, { apps }) => apps,
  }),
  fleetList: buildReducer([], {
    SET_FLEET_LIST: (state, { fleetList }) => fleetList,
  }),
  ip: buildReducer('', {
    SET_IP: (state, { ip }) => ip,
  }),
  bottomBarText: buildReducer('', {
    SET_BOTTOM_BAR_TEXT: (state, { bottomBarText }) => bottomBarText,
  }),
  atticData: buildReducer({}, {
    SET_ATTIC_DATA: (state, { atticData }) => atticData,
  }),
  conduitData: buildReducer({}, {
    SET_CONDUIT_DATA: (state, { conduitData }) => conduitData,
  }),
  ambienceData: buildReducer({}, {
    SET_AMBIENCE_DATA: (state, { ambienceData }) => ambienceData,
  }),
  visualsData: buildReducer({}, {
    SET_VISUALS_DATA: (state, { visualsData }) => visualsData,
  }),
});
