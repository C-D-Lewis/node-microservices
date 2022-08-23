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
    .setText(`< ${deviceName}`);

  return fab.Row().withChildren([backButton, deviceSegment]);
};

/**
 * SubNavBar component.
 *
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const SubNavBar = () => fab.Row()
  .withStyles({
    backgroundColor: '#666',
    paddingLeft: '8px',
    boxShadow: '2px 2px 3px 1px #0004',
  })
  .withChildren([
    fab.when(({ page }) => page === 'FleetPage', () => StaticBreadcrumb()),
    fab.when(({ page }) => page === 'AppsPage', () => BackBreadcrumb()),
  ]);
