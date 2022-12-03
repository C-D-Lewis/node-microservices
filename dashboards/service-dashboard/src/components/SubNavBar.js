/**
 * AllDevicesBreadcrumb component.
 *
 * @returns {HTMLElement}
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
 */
const rebootDevice = async (el, { fleetList, ip }) => {
  // eslint-disable-next-line no-restricted-globals
  if (!confirm('Caution: If devices share an IP this might not be the actual device - continue?')) return;

  const {
    deviceName,
  } = fleetList.find(({ publicIp, localIp }) => ip === publicIp || localIp === ip);

  try {
    // Public, then local
    const { content, error } = await fetch(`http://${ip}:5959/reboot`, { method: 'POST' }).then((r) => r.json());

    if (content) {
      fabricate.update('logEntries', ({ logEntries }) => [...logEntries, `Device ${deviceName} is rebooting now`]);
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
 * @returns {HTMLElement}
 */
const RebootButton = () => fabricate('IconButton', { src: 'assets/restart.png' })
  .setStyles({ width: '18px', height: '18px' })
  .onClick(rebootDevice);

/**
 * BackBreadcrumb component.
 *
 * @returns {HTMLElement}
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
    .onUpdate((el, { fleetList, ip }) => {
      const [found] = fleetList.filter(
        ({ publicIp, localIp }) => ip === publicIp || localIp === ip,
      );
      if (found) deviceSegment.setText(`< ${found.deviceName} (${ip})`);
    }, ['fleetList', 'ip']);
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
