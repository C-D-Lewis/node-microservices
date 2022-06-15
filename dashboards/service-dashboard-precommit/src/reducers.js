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
  token: buildReducer('', {
    SET_TOKEN: (state, { token }) => token,
  }),
  ResponseBarText: buildReducer('', {
    SET_BOTTOM_BAR_TEXT: (state, { ResponseBarText }) => ResponseBarText,
  }),
  atticData: buildReducer({}, {
    SET_ATTIC_DATA: (state, { atticData }) => atticData,
  }),
  conduitData: buildReducer({}, {
    SET_CONDUIT_DATA: (state, { conduitData }) => conduitData,
  }),
  visualsData: buildReducer({}, {
    SET_VISUALS_DATA: (state, { visualsData }) => visualsData,
  }),
});
