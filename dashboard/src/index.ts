import { Fabricate } from 'fabricate.js';
import { AppState } from './types.ts';
import Theme from './theme.ts';
import { INITIAL_STATE } from './constants.ts';
import { parseParams } from './util.ts';
import SideBar from './components/SideBar.ts';
import AppArea from './components/AppArea.ts';
import { fetchFleetList } from './services/conduitService.ts';
import ConsoleView from './components/ConsolePane.ts';

declare const fabricate: Fabricate<AppState>;

const ConsoleButton = () => fabricate('Image', { src: 'assets/images/console.png' })
  .setStyles({
    marginLeft: 'auto',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
  })
  .onClick((el, { consoleOpen }) => {
    fabricate.update({ consoleOpen: !consoleOpen });
  });

/**
 * AppNavBar component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const AppNavBar = () => fabricate('NavBar', {
  title: 'Node Microservices Dashboard',
  backgroundColor: Theme.palette.primary,
})
.onUpdate((el, { consoleEnabled }) => {
  if (!consoleEnabled) return;

  el.addChildren([ConsoleButton()]);
}, ['consoleEnabled']);

/**
 * Patch console.log to update the console logs in the state for the console view.
 */
const patchConsoleLog = () => {
  // Get logs as they occur.
  const originalConsoleLog = console.log;
  /**
   * Override console.log to update the console logs in the state.
   *
   * @param args - Arguments to log.
   */
  window.console.log = (msg) => {
    originalConsoleLog(msg);
    
    fabricate.update('consoleLogs', (state: AppState) => [...state.consoleLogs, msg]);
  };
};

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
        ConsoleView(),
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

    if (keys.includes('consoleEnabled') && state.consoleEnabled) {
      patchConsoleLog();
    }
  }, [fabricate.StateKeys.Created, 'token', 'consoleEnabled']);

fabricate.app(
  App,
  INITIAL_STATE,
  { theme: Theme },
);
