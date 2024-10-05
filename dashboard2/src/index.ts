import { Fabricate } from 'fabricate.js';
import { AppState } from './types';
import Theme from './theme';
import { INITIAL_STATE } from './constants';
import { parseParams, fetchFleetList } from './util';
import SideBar from './components/SideBar';

declare const fabricate: Fabricate<AppState>;

/**
 * AppNavBar component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const AppNavBar = () => fabricate('NavBar', {
  title: 'Fleet Dashboard',
  backgroundColor: Theme.palette.primary,
});

/**
 * App component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const App = () => fabricate('Column')
  .setChildren([
    AppNavBar(),
    SideBar(),
  ])
  .onUpdate(async (el, state, keys) => {
    if (keys.includes(fabricate.StateKeys.Created)) {
      parseParams();
      return;
    }

    if (keys.includes('token')) {
      await fetchFleetList(state);
    }
  }, [fabricate.StateKeys.Created, 'token']);

fabricate.app(
  App,
  INITIAL_STATE,
  { theme: Theme },
);
