import { Fabricate } from 'fabricate.js';
import { AppState } from './types.ts';
import Theme from './theme.ts';
import { INITIAL_STATE } from './constants.ts';
import { parseParams } from './util.ts';
import SideBar from './components/SideBar.ts';
import AppArea from './components/AppArea.ts';
import { fetchFleetList } from './services/conduitService.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * AppNavBar component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const AppNavBar = () => fabricate('NavBar', {
  title: 'Node Microservices Dashboard',
  backgroundColor: Theme.palette.primary,
});

/**
 * App component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const App = () => fabricate('Column')
  .setStyles({ height: '100vh' })
  .setChildren([
    AppNavBar(),
    fabricate('Row')
      .setStyles({ height: '100vh' })
      .setNarrowStyles({ flexWrap: 'wrap' })
      .setChildren([
        SideBar(),
        AppArea(),
      ]),
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
