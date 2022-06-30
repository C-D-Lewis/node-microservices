/* eslint-disable no-return-assign */
// eslint-disable-next-line max-len
/* global INITIAL_STATE CONDUIT_PORT ResponseBar TextBox IconButton FleetItem AppCard sendPacket */

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
 * FleetTitle component.
 *
 * @returns {HTMLElement}
 */
 const FleetTitle = () => fab('p')
  .withStyles({
    color: Colors.veryDarkGrey,
    margin: '10px 15px',
    fontWeight: 'bold',
  })
  .setText('Device Fleet');

/**
 * BackBreadcrumb component.
 *
 * @returns {HTMLElement}
 */
 const BackBreadcrumb = () => fab('p')
  .withStyles({
    color: Colors.veryDarkGrey,
    margin: '10px 15px',
    fontWeight: 'bold',
    cursor: 'pointer',
  })
  .setText('< Back')
  .onClick(() => fab.updateState('page', () => 'fleetPage'));

/**
 * FleetPage component.
 *
 * @returns {HTMLElement}
 */
const FleetPage = () => fab.Column()
  .watchState((el, { fleetList }) => {
    el.clear();
    el.addChildren([
      FleetTitle(),
      fab.Row()
        .withStyles({
          flexWrap: 'wrap',
          padding: '10px',
        })
        .withChildren(fleetList.map((itemData) => FleetItem({ itemData }))),
    ]);
  }, ['fleetList']);

/**
 * AppsPage component.
 *
 * @returns {HTMLElement}
 */
const AppsPage = () => fab.Column()
  .watchState((el, { apps }) => {
    el.clear();
    el.addChildren([
      BackBreadcrumb(),
      ResponseBar(),
      fab.Row()
        .withStyles({ flexWrap: 'wrap' })
        .withChildren([...apps.map((appData) => AppCard({ app: appData.app }))]),
    ]);
  }, ['apps']);

/**
 * ServiceDashboard component.
 *
 * @returns {HTMLElement}
 */
const ServiceDashboard = () => fab.Column()
  .withChildren([
    AppNavBar(),
    fab.when(state => state.page === 'fleetPage', () => FleetPage()),
    fab.when(state => state.page === 'appsPage', () => AppsPage()),
  ])
  .watchState((el, newState, key) => {
    if (key === 'fabricate:init') parseParams();
    if (key === 'ip') fetchApps();
    if (key === 'token') fetchFleetList();
  }, ['fabricate:init', 'ip', 'token']);

fabricate.app(ServiceDashboard(), INITIAL_STATE, { logStateUpdates: false });
