/* eslint-disable no-return-assign */
// eslint-disable-next-line max-len
/* global INITIAL_STATE CONDUIT_PORT IconButton SubNavBar AppsPage FleetPage sendPacket */

/**
 * Re-load the fleet list data.
 */
const fetchFleetList = async () => {
  fab.updateState('fleetList', () => []);

  try {
    const { message } = await sendPacket({
      to: 'attic',
      topic: 'get',
      message: { app: 'conduit', key: 'fleetList' },
    });
    fab.updateState('fleetList', () => message.value);
  } catch (err) {
    console.error(err);
    alert(err);
  }
};

/**
 * Load apps for the selected IP address.
 */
const fetchApps = async () => {
  fab.updateState('apps', () => []);

  try {
    const res = await fetch(`http://${fab.getState('ip')}:${CONDUIT_PORT}/apps`);
    const json = await res.json();
    const apps =  json.sort((a, b) => (a.app < b.app ? -1 : 1));
    fab.updateState('apps', () => apps);
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
  if (tokenVal) fab.updateState('token', () => tokenVal);
};

/**
 * AppNavBar component.
 *
 * @returns {HTMLElement}
 */
const AppNavBar = () => fab.NavBar({
  title: 'Service Dashboard',
  backgroundColor: Colors.primaryDark,
})
  .withChildren([
    fab.Row()
      .withStyles({ justifyContent: 'flex-end', flex: 1 })
      .withChildren([
        // TextBox({ placeholder: 'IP address' })
        //   .withStyles({ margin: '0px 10px 0px 30px' })
        //   .watchState((el, { ip }) => (el.value = ip), ['ip'])
        //   .onChange((el, value) => fab.updateState('ip', () => value)),
        // TextBox({ placeholder: 'Token' })
        //   .withStyles({ margin: '0px 10px' })
        //   .watchState((el, { token }) => (el.value = token), ['token'])
        //   .onChange((el, value) => fab.updateState('token', () => value)),
        IconButton({ src: '../assets/reload.png' })
          .onClick(async () => {
            await fetchFleetList();
            await fetchApps();
          }),
      ]),
  ]);

/**
 * ServiceDashboard component.
 *
 * @returns {HTMLElement}
 */
const ServiceDashboard = () => fab.Column()
  .withChildren([
    AppNavBar(),
    SubNavBar(),
    fab.when(({ page }) => page === 'fleetPage', () => FleetPage()),
    fab.when(({ page }) => page === 'appsPage', () => AppsPage()),
  ])
  .watchState((el, newState, key) => {
    if (key === 'fabricate:init') parseParams();
    if (key === 'ip') fetchApps();
    if (key === 'token') fetchFleetList();
  }, ['fabricate:init', 'ip', 'token']);

fabricate.app(ServiceDashboard(), INITIAL_STATE, { logStateUpdates: false });
