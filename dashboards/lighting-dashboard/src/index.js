/* global DeviceCard websocketConnect */

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
      .map((d) => DeviceCard({ device: d }));

    el.addChildren(
      deviceCards.length
        ? deviceCards
        : [
          fabricate.Text({ text: 'No devices are connected' })
            .withStyles({
              color: 'white',
              marginTop: '25px',
            }),
        ],
    );
  });

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
  devices: [],
};
fabricate.app(LightingDashboard(), initialState);

// Connect WebSocket server
websocketConnect();
