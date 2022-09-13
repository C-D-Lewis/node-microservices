/* global WsService */

/**
 * AppNavBar component.
 *
 * @returns {HTMLElement}
 */
const AppNavBar = () => fabricate.NavBar({
  title: 'Lighting Dashboard',
  backgroundColor: Theme.Colors.primary,
})
  .withChildren([
    fabricate.Text({ text: 'Server' })
      .withStyles({
        marginLeft: 'auto',
        color: Theme.Colors.lightGrey,
        cursor: 'default',
      }),
    fabricate('LED')
      .watchState((el, state) => el.setConnected(state.connected)),
  ]);

/**
 * DeviceList component.
 *
 * @returns {HTMLElement}
 */
const DeviceList = () => fabricate.Column()
  .withStyles({ alignItems: 'center' })
  .watchState((el, state) => {
    el.clear();

    const deviceCards = state.devices
      .filter((p) => !window.Config.ignoreHosts.includes(p.hostname))
      .map((d) => fabricate('DeviceCard', { device: d }));

    const noDevicesText = fabricate.Text({ text: 'No devices are connected' })
      .withStyles({
        color: Theme.Colors.lightGrey,
        marginTop: '25px',
      });

    el.addChildren(
      deviceCards.length > 0
        ? deviceCards
        : [noDevicesText],
    );
  });

/**
 * LightingDashboard component.
 *
 * @returns {HTMLElement}
 */
const LightingDashboard = () => fabricate.Column()
  .withStyles({ width: '100%' })
  .withChildren([
    AppNavBar(),
    DeviceList(),
  ]);

const initialState = {
  devices: [],
};
fabricate.app(LightingDashboard(), initialState);

// Connect WebSocket server
WsService.connect();
