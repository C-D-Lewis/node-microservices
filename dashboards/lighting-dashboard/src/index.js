/**
 * AppNavBar component.
 *
 * @returns {HTMLElement} Component.
 */
const AppNavBar = () => fabricate('NavBar', {
  title: 'Lighting Dashboard',
  backgroundColor: Theme.colors.primary,
})
  .addChildren([
    fabricate('Text')
      .setStyles({
        marginLeft: 'auto',
        color: Theme.colors.lightGrey,
        cursor: 'default',
      })
      .setText('Server'),
    fabricate('LED')
      .onUpdate((el, { connected }) => el.setConnected(connected), ['connected']),
  ]);

/**
 * NoDevicesText component.
 *
 * @returns {HTMLElement} Component.
 */
const NoDevicesText = () => fabricate('Text')
  .setStyles({ color: Theme.colors.lightGrey, marginTop: '25px' })
  .setText('No devices are connected');

/**
 * DeviceList component.
 *
 * @returns {HTMLElement} Component.
 */
const DeviceList = () => fabricate('Column')
  .setStyles({ alignItems: 'center' })
  .onUpdate((el, state) => {
    const deviceCards = state.devices
      .filter((p) => !window.Config.ignoreHosts.includes(p.hostname))
      .map((device) => fabricate('DeviceCard', { device }));

    el.setChildren(
      deviceCards.length > 0
        ? deviceCards
        : [NoDevicesText()],
    );
  });

/**
 * Get fleet list.
 */
const getFleetDevices = async () => {
  const res = await BifrostService.send({
    to: 'attic',
    topic: 'get',
    message: {
      app: 'bifrost',
      key: 'fleetList',
    },
  });
  console.log({ res });
};

/**
 * LightingDashboard component.
 *
 * @returns {HTMLElement} Component.
 */
const LightingDashboard = () => fabricate('Column')
  .setStyles({ width: '100%' })
  .setChildren([
    AppNavBar(),
    DeviceList(),
  ]);

const initialState = {
  devices: [],
  connected: false,
};
fabricate.app(LightingDashboard(), initialState);

// Connect WebSocket server then get devices
BifrostService.connect().then(getFleetDevices);
