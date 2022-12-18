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
 * Reboot this device.
 *
 * @param {HTMLElement} el - Fabricate component.
 * @param {object} state - Current state.
 * @param {string} state.selectedIp - Selected IP.
 * @param {string} state.selectedDeviceName - Selected device name.
 */
const rebootDevice = async (el, { selectedIp, selectedDeviceName }) => {
  // eslint-disable-next-line no-restricted-globals
  if (!confirm('Caution: If devices share an IP this might not be the actual device - continue?')) return;

  try {
    // Public, then local
    const { content, error } = await fetch(`http://${selectedIp}:5959/reboot`, { method: 'POST' }).then((r) => r.json());

    if (content) {
      fabricate.update('logEntries', ({ logEntries }) => [...logEntries, `Device ${selectedDeviceName} is rebooting now`]);
    } else {
      throw new Error(error);
    }
  } catch (e) {
    alert(e);
    console.log(e);
  }
};

/**
 * RebootButton component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const RebootButton = () => fabricate('IconButton', { src: 'assets/restart.png' })
  .setStyles({ width: '18px', height: '18px' })
  .onClick(rebootDevice);

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
