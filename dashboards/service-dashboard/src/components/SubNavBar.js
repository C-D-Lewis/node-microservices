/**
 * StaticBreadcrumb component.
 *
 * @returns {HTMLElement}
 */
const StaticBreadcrumb = () => fab('p')
  .withStyles({
    color: 'black',
    margin: '10px 15px',
    cursor: 'default',
  })
  .setText('Device Fleet');

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
      color: 'black',
      margin: '10px 5px 10px 15px',
      cursor: 'pointer',
      textDecoration: 'underline',
    })
    .setText('Device Fleet')
    .onClick(() => fab.updateState('page', () => 'fleetPage'));

  const deviceLabel = fab('p')
    .withStyles({ color: 'black', margin: '10px 5px' })
    .setText(`< ${deviceName}`);

  return fab.Row().withChildren([backButton, deviceLabel]);
};

/**
 * SubNavBar component.
 *
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const SubNavBar = () => fab.Row()
  .withStyles({
    backgroundColor: 'white',
    paddingLeft: '8px',
    boxShadow: '2px 2px 3px 1px #5555',
  })
  .withChildren([
    fab.when(({ page }) => page === 'fleetPage', () => StaticBreadcrumb()),
    fab.when(({ page }) => page === 'appsPage', () => BackBreadcrumb()),
  ]);
