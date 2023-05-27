/**
 * AllDevicesBreadcrumb component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const AllDevicesBreadcrumb = () => fabricate('p')
  .setStyles({
    color: 'white',
    margin: '10px 15px',
    cursor: 'default',
  })
  .setText('All Devices');

/**
 * Send a device command by URL.
 *
 * @param {object} state - Current state.
 * @param {string} state.selectedIp - Selected IP.
 * @param {string} state.selectedDeviceName - Selected device name.
 * @param {string} command - Command, either 'reboot' or 'shutdown'.
 */
const commandDevice = async ({ selectedIp, selectedDeviceName }, command) => {
  // eslint-disable-next-line no-restricted-globals
  if (!confirm('Caution: If devices share an IP this might not be the actual device - continue?')) return;

  try {
    // Public, then local
    const { content, error } = await fetch(`http://${selectedIp}:5959/${command}`, { method: 'POST' }).then((r) => r.json());

    if (content) {
      console.log(`Device ${selectedDeviceName} command sent`);
    } else {
      throw new Error(error);
    }
  } catch (e) {
    alert(e);
    console.log(e);
  }
};

/**
 * ToolbarButton component.
 *
 * @param {object} props - Component props.
 * @param {string} props.src - Image src.
 * @returns {HTMLElement} Fabricate component.
 */
const ToolbarButton = ({ src }) => fabricate('IconButton', { src })
  .setStyles({ width: '18px', height: '18px' });

/**
 * RebootButton component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const RebootButton = () => ToolbarButton({ src: 'assets/restart.png' })
  .onClick((el, state) => commandDevice(state, 'reboot'));

/**
 * ShutdownButton component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ShutdownButton = () => ToolbarButton({ src: 'assets/shutdown.png' })
  .onClick((el, state) => commandDevice(state, 'shutdown'));

/**
 * BackBreadcrumb component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const BackBreadcrumb = () => {
  const backButton = fabricate('p')
    .setStyles({
      color: 'white',
      margin: '10px 5px 10px 15px',
      cursor: 'pointer',
      textDecoration: 'underline',
    })
    .setText('All Devices')
    .onClick(() => fabricate.update({ page: 'FleetPage' }));

  const deviceSegment = fabricate('p')
    .setStyles({ color: 'white', margin: '10px 5px' });

  return fabricate('Row')
    .setStyles({ alignItems: 'center' })
    .setChildren([
      backButton,
      deviceSegment,
      RebootButton(),
      ShutdownButton(),
    ])
    .onUpdate((el, { fleetList, selectedIp, selectedDeviceName }) => {
      const [found] = fleetList.filter(({ deviceName }) => deviceName === selectedDeviceName);
      if (found) deviceSegment.setText(`< ${found.deviceName} (${selectedIp})`);
    }, ['fleetList', 'selectedIp']);
};

/**
 * SubNavBar component.
 */
fabricate.declare('SubNavBar', () => fabricate('Row')
  .setStyles({
    backgroundColor: Theme.colors.SubNavBar.background,
    paddingLeft: '8px',
    boxShadow: '2px 2px 3px 1px #0004',
  })
  .setChildren([
    AllDevicesBreadcrumb().when(({ page }) => page === 'FleetPage'),
    BackBreadcrumb().when(({ page }) => page === 'AppsPage'),
  ]));
