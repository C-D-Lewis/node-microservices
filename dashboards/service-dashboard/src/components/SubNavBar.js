/**
 * StaticBreadcrumb component.
 *
 * @returns {HTMLElement}
 */
const StaticBreadcrumb = () => fab('p')
  .withStyles({
    color: 'white',
    margin: '10px 15px',
    cursor: 'default',
  })
  .setText('All Devices');

/**
 * BackBreadcrumb component.
 *
 * @returns {HTMLElement}
 */
const BackBreadcrumb = () => {
  const fleetList = fab.getState('fleetList');
  const ip = fab.getState('ip');
  const {
    deviceName,
  } = fleetList.find(({ publicIp, localIp }) => ip === publicIp || localIp === ip);

  /**
   * Reboot this device.
   */
  const rebootDevice = async () => {
    if (!confirm('Caution: If devices share an IP this might not be the actual device - continue?')) return;

    try {
      // Public, then local
      const { content, error } = await fetch(`http://${ip}:5959/reboot`, { method: 'POST' }).then(r => r.json());

      if (content)
        fab.updateState('logEntries', ({ logEntries }) => [...logEntries, `Device ${deviceName} is rebooting now`]);
      else
        throw new Error(error);
    } catch (e) {
      alert(e);
      console.log(e);
    }
  };

  const backButton = fab('p')
    .withStyles({
      color: 'white',
      margin: '10px 5px 10px 15px',
      cursor: 'pointer',
      textDecoration: 'underline',
    })
    .setText('All Devices')
    .onClick(() => fab.updateState('page', () => 'FleetPage'));

  const deviceSegment = fab('p')
    .withStyles({ color: 'white', margin: '10px 5px' })
    .setText(`< ${deviceName} (${ip})`);

  const rebootButton = IconButton({ src: 'assets/restart.png' })
    .withStyles({ width: '18px', height: '18px' })
    .onClick(rebootDevice);

  return fab.Row()
    .withStyles({ alignItems: 'center' })
    .withChildren([
      backButton,
      deviceSegment,
      rebootButton,
    ]);
};

/**
 * SubNavBar component.
 *
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const SubNavBar = () => fab.Row()
  .withStyles({
    backgroundColor: Colors.SubNavBar.background,
    paddingLeft: '8px',
    boxShadow: '2px 2px 3px 1px #0004',
  })
  .withChildren([
    fab.when(({ page }) => page === 'FleetPage', () => StaticBreadcrumb()),
    fab.when(({ page }) => page === 'AppsPage', () => BackBreadcrumb()),
  ]);
