import { combineReducers } from 'redux';

const buildReducer = (firstValue, subreducers) => (state = firstValue, action) =>
    subreducers[action.type]
      ? subreducers[action.type](state, action)
      : state;

export const rootReducer = combineReducers({
  devices: buildReducer([], {
    SET_DEVICES: (state, { devices }) => devices,
  }),
  requestInProgress: buildReducer([], {
    SET_REQUEST_IN_PROGRESS: (state, { requestInProgress }) => requestInProgress,
  }),
});
