/**
 * Re-load the fleet list data.
 *
 * @param {HTMLElement} el - This element.
 * @param {object} state - App state.
 */
const fetchFleetList = async (el, state) => {
  fabricate.update({ fleetList: [] });

  try {
    const { message } = await ConduitService.sendPacket(state, {
      to: 'attic',
      topic: 'get',
      message: { app: 'conduit', key: 'fleetList' },
    });
    fabricate.update({ fleetList: message.value });
  } catch (err) {
    console.error(err);
    alert(err);
  }
};

/**
 * Load apps for the selected IP address.
 *
 * @param {HTMLElement} el - This element.
 * @param {object} state - App state.
 */
const fetchApps = async (el, state) => {
  fabricate.update({ apps: [] });

  // TODO: How to fetch apps via the public host? conduit topic with 'host' instead of GET?

  try {
    const { message: apps } = await ConduitService.sendPacket(state, { to: 'conduit', topic: 'getApps' });
    fabricate.update({ apps });
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
  const token = params.get('token');
  if (token) fabricate.update({ token });
};

/**
 * AppNavBar component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const AppNavBar = () => fabricate('NavBar', {
  title: 'Service Dashboard',
  backgroundColor: Theme.colors.AppNavBar.background,
});

/**
 * ServiceDashboard component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ServiceDashboard = () => fabricate('Column')
  .setChildren([
    AppNavBar(),
    fabricate('SubNavBar'),
    fabricate('FleetPage').when(({ page }) => page === 'FleetPage'),
    fabricate('AppsPage').when(({ page }) => page === 'AppsPage'),
  ])
  .onUpdate(parseParams, ['fabricate:init'])
  .onUpdate(fetchApps, ['selectedIp'])
  .onUpdate(fetchFleetList, ['token']);

fabricate.app(ServiceDashboard(), Constants.INITIAL_STATE);
