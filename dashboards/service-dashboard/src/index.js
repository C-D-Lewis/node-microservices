/**
 * Re-load the fleet list data.
 *
 * @param {HTMLElement} el - This element.
 * @param {object} state - App state.
 */
const fetchFleetList = async (el, state) => {
  fabricate.update({ fleet: [] });

  try {
    const { message } = await ConduitService.sendPacket(state, {
      to: 'attic',
      topic: 'get',
      message: { app: 'conduit', key: 'fleetList' },
    });
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
})
  .addChildren([
    fabricate('IconButton', { src: 'assets/log.png' })
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
    fabricate('SubNavBar'),
    fabricate('FleetPage').when(({ page }) => page === 'FleetPage'),
    fabricate('AppsPage').when(({ page }) => page === 'AppsPage'),
    fabricate('ResponseLog'),
  ])
  .onUpdate(parseParams, ['fabricate:init'])
  .onUpdate(fetchFleetList, ['token']);

fabricate.app(ServiceDashboard(), Constants.INITIAL_STATE);
