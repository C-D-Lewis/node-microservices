import { combineReducers } from 'redux';

const buildReducer = (firstValue, subreducers) => (state = firstValue, action) =>
    subreducers[action.type]
      ? subreducers[action.type](state, action)
      : state;

export const rootReducer = combineReducers({
  devices: buildReducer([], {
    SET_DEVICES: (state, { devices }) => devices,
  }),
});
