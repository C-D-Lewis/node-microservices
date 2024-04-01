import { Fabricate } from 'fabricate.js';
import { AppState } from './types';
import Theme from './theme';
import { CONDUIT_PORT, INITIAL_STATE } from './constants';
import SubNavBar from './components/SubNavBar';
import FleetPage from './pages/FleetPage';
import AppsPage from './pages/AppsPage';

declare const fabricate: Fabricate<AppState>;

/**
 * Re-load the fleet list data.
 *
 * @param {object} state - App state.
 */
const fetchFleetList = async (state: AppState) => {
  const { fleetHost, token } = state;
  fabricate.update({ fleet: [] });

  try {
    const res = await fetch(`http://${fleetHost}:${CONDUIT_PORT}/conduit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'attic',
        topic: 'get',
        message: { app: 'conduit', key: 'fleetList' },
        auth: token || '',
      }),
    });
    const { message } = await res.json();
    fabricate.update({ fleet: message.value });
  } catch (err) {
    console.error(err);
    alert(err);
  }
};

/**
 * Parse query params.
 */
const parseParams = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (!token) {
    alert('Please provide token param');
    return;
  }

  fabricate.update({ token });
};

/**
 * AppNavBar component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const AppNavBar = () => fabricate('NavBar', {
  title: 'Service Dashboard',
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
    SubNavBar(),
    fabricate.conditional(({ page }) => page === 'FleetPage', FleetPage),
    fabricate.conditional(({ page }) => page === 'AppsPage', AppsPage),
  ])
  .onUpdate((el, state, keys) => {
    if (keys.includes('fabricate:init')) {
      parseParams();
      return;
    }

    if (keys.includes('token')) {
      fetchFleetList(state);
    }
  }, ['fabricate:init', 'token']);

fabricate.app(
  App,
  INITIAL_STATE,
  { theme: Theme },
);
