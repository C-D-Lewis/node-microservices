import { Fabricate } from 'fabricate.js';
import { AppState } from './types';
import Theme from './theme';
import { CONDUIT_PORT, INITIAL_STATE } from './constants';
import SubNavBar from './components/SubNavBar';
import FleetPage from './pages/FleetPage';
import AppsPage from './pages/AppsPage';
import ResponseLog from './components/ResponseLog';
import IconButton from './components/IconButton';

declare const fabricate: Fabricate<AppState>;

/**
 * Re-load the fleet list data.
 *
 * @param {HTMLElement} el - This element.
 * @param {object} state - App state.
 */
const fetchFleetList = async (el: HTMLElement, state: AppState) => {
  const { host, token } = state;
  fabricate.update({ fleet: [] });

  try {
    const res = await fetch(`http://${host}:${CONDUIT_PORT}/conduit`, {
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

  // Token
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
})
  .addChildren([
    IconButton({ src: 'assets/log.png' })
      .onClick((el, state) => fabricate.update('logExpanded', !state.logExpanded)),
  ]);

/**
 * ServiceDashboard component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ServiceDashboard = () => fabricate('Column')
  .setChildren([
    AppNavBar(),
    SubNavBar(),
    fabricate.conditional(({ page }) => page === 'FleetPage', FleetPage),
    fabricate.conditional(({ page }) => page === 'AppsPage', AppsPage),
    ResponseLog(),
  ])
  .onUpdate(parseParams, ['fabricate:init'])
  .onUpdate(fetchFleetList, ['token']);

fabricate.app(ServiceDashboard(), INITIAL_STATE, { strict: true });
