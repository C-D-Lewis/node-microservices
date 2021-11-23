const {
  deviceList,
} = window.Config;

if (!deviceList || deviceList.length < 1) {
  alert('config.json not setup');
}

/**
 * DeviceList component.
 *
 * @returns {HTMLElement}
 */
const DeviceList = () => fabricate.Column()
  .withStyles({ alignItems: 'center' })
  .addChildren(deviceList.map(d => DeviceCard({ device: d })));

/**
 * LightingDashboard component.
 *
 * @returns {HTMLElement}
 */
const LightingDashboard = () => fabricate.Column()
  .withStyles({ width: '100%' })
  .addChildren([
    fabricate.NavBar({
      title: 'Lighting Dashboard',
      backgroundColor: Theme.Colors.primary,
    }),
    DeviceList(),
  ]);

const initialState = {
  requestInProgress: false,
  devices: [...deviceList],
};
fabricate.app(LightingDashboard(), initialState);

// Connect WebSockets
websocketConnect();
