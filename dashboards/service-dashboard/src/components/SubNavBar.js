/* global Theme */

/**
 * StaticBreadcrumb component.
 *
 * @returns {HTMLElement}
 */
const StaticBreadcrumb = () => fabricate('p')
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
        fabricate.updateState('logEntries', ({ logEntries }) => [...logEntries, `Device ${deviceName} is rebooting now`]);
      } else {
        throw new Error(error);
      }
    } catch (e) {
      alert(e);
      console.log(e);
    }
  };

  const backButton = fabricate('p')
    .withStyles({
      color: 'white',
      margin: '10px 5px 10px 15px',
      cursor: 'pointer',
      textDecoration: 'underline',
    })
    .setText('All Devices')
    .onClick(() => fabricate.updateState('page', () => 'FleetPage'));

  const deviceSegment = fabricate('p')
    .withStyles({ color: 'white', margin: '10px 5px' });

  const rebootButton = fabricate('IconButton', { src: 'assets/restart.png' })
    .withStyles({ width: '18px', height: '18px' })
    .onClick(rebootDevice);

  return fabricate.Row()
    .withStyles({ alignItems: 'center' })
    .withChildren([
      backButton,
      deviceSegment,
      rebootButton,
    ])
    .then((el, { fleetList, ip }) => {
      const {
        deviceName,
      } = fleetList.find(({ publicIp, localIp }) => ip === publicIp || localIp === ip);
      deviceSegment.setText(`< ${deviceName} (${ip})`);
    });
};

/**
 * SubNavBar component.
 */
fabricate.declare('SubNavBar', () => fabricate.Row()
  .withStyles({
    backgroundColor: Theme.colors.SubNavBar.background,
    paddingLeft: '8px',
    boxShadow: '2px 2px 3px 1px #0004',
  })
  .withChildren([
    fabricate.when(({ page }) => page === 'FleetPage', () => StaticBreadcrumb()),
    fabricate.when(({ page }) => page === 'AppsPage', () => BackBreadcrumb()),
  ]));
