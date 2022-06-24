// eslint-disable-next-line max-len
/* global LeftColumn MainArea ResponseBar TextBox IconButton FleetItem AppCard sendPacket */

const {
  /* Where the fleet list can be found. */
  FLEET_HOST,
} = window.config;

/** Port to look for conduit apps */
const CONDUIT_PORT = 5959;
/** Initial total app state */
const INITIAL_STATE = {
  apps: [],
  fleetList: [],
  ip: FLEET_HOST,
  responseBarText: 'Ready',
  atticData: {
    app: '',
    key: '',
    value: '',
  },
  conduitData: {
    app: '',
    topic: 'status',
    message: '{}',
  },
  visualsData: {
    index: 0,
    red: 128,
    green: 128,
    blue: 128,
    text: '',
  },
};

/**
 * Re-load the fleet list data.
 */
const loadFleetList = async () => {
  fab.updateState('fleetList', () => []);

  try {
    const { message } = await sendPacket({
      to: 'attic',
      topic: 'get',
      message: { app: 'conduit', key: 'fleetList' },
    });
    const fleetList = message.value;
    fab.updateState('fleetList', () => fleetList);
  } catch (err) {
    console.error(err);
  }
};

/**
 * Load apps for the selected IP address.
 */
const loadApps = async () => {
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
  backgroundColor: Colors.primary,
})
  .withChildren([
    TextBox({ placeholder: 'IP address' })
      .withStyles({ margin: '0px 10px 0px 30px' })
      .watchState((el, { ip }) => {
        el.value = ip;
      }, ['ip'])
      .onChange((el, value) => fab.updateState('ip', () => value)),
    TextBox({ placeholder: 'Token' })
      .withStyles({ margin: '0px 10px' })
      .watchState((el, { token }) => {
        el.value = token;
      }, ['token'])
      .onChange((el, value) => fab.updateState('token', () => value)),
    IconButton({ iconSrc: '../assets/reload.png' })
      .onClick(async () => {
        await loadFleetList();
        await loadApps();
      }),
  ]);

/**
 * ServiceDashboard component.
 *
 * @returns {HTMLElement}
 */
const ServiceDashboard = () => fab.Column()
  .withChildren([
    AppNavBar(),
    fab.Row()
      .withChildren([
        LeftColumn()
          .watchState((el, { fleetList }) => {
            el.clear();
            el.addChildren(fleetList.map((itemData) => FleetItem({ itemData })));
          }, ['fleetList']),
        MainArea()
          .watchState((el, { apps }) => {
            el.clear();
            el.addChildren([
              ResponseBar(),
              ...apps.map((appData) => AppCard({ app: appData.app })),
            ]);
          }, ['apps']),
      ]),
  ])
  .watchState((el, newState, key) => {
    if (key === 'fabricate:init') parseParams();
    if (key === 'ip') loadApps();
    if (key === 'token') loadFleetList();
  }, ['fabricate:init', 'ip', 'token']);

fabricate.app(ServiceDashboard(), INITIAL_STATE, { logStateUpdates: false });
