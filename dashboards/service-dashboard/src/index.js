/* global Constants ConduitService Theme */

/**
 * Re-load the fleet list data.
 */
const fetchFleetList = async () => {
  fabricate.updateState('fleetList', () => []);

  try {
    const { message } = await ConduitService.sendPacket({
      to: 'attic',
      topic: 'get',
      message: { app: 'conduit', key: 'fleetList' },
    });
    fabricate.updateState('fleetList', () => message.value);
  } catch (err) {
    console.error(err);
    alert(err);
  }
};

/**
 * Load apps for the selected IP address.
 */
const fetchApps = async (el, state) => {
  fabricate.updateState('apps', () => []);

  try {
    const res = await fetch(`http://${state.ip}:${Constants.CONDUIT_PORT}/apps`);
    const json = await res.json();
    const apps =  json.sort((a, b) => (a.app < b.app ? -1 : 1));
    fabricate.updateState('apps', () => apps);
  } catch (err) {
    console.error(err);
  }
};

/**
 * Parse query params.
 */
const parseParams = () => {
  const params = new URLSearchParams(window.location.search);

  // Token
  const tokenVal = params.get('token');
  if (tokenVal) fabricate.updateState('token', () => tokenVal);
};

/**
 * AppNavBar component.
 *
 * @returns {HTMLElement}
 */
const AppNavBar = () => fabricate.NavBar({
  title: 'Service Dashboard',
  backgroundColor: Theme.colors.AppNavBar.background,
});

/**
 * ServiceDashboard component.
 *
 * @returns {HTMLElement}
 */
const ServiceDashboard = () => fabricate.Column()
  .withChildren([
    AppNavBar(),
    fabricate('SubNavBar'),
    fabricate.when(({ page }) => page === 'FleetPage', () => fabricate('FleetPage')),
    fabricate.when(({ page }) => page === 'AppsPage', () => fabricate('AppsPage')),
  ])
  .watchState(parseParams, ['fabricate:init'])
  .watchState(fetchApps, ['ip'])
  .watchState(fetchFleetList, ['token']);

fabricate.app(ServiceDashboard(), Constants.INITIAL_STATE, { logStateUpdates: false });
