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
 * @param {string} topic - Command topic, either 'reboot' or 'shutdown'.
 */
const commandDevice = async (state, topic) => {
  // eslint-disable-next-line no-restricted-globals
  if (!confirm('Caution: If devices share a public IP this might not be the correct device - continue?')) return;

  try {
    const { error } = await ConduitService.sendPacket(state, { to: 'conduit', topic });
    if (error) throw new Error(error);

    alert(`Device ${state.selectedDeviceName} sent ${topic} command`);
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
  .onHover((el, state, isHovered) => el.setStyles({ backgroundColor: isHovered ? 'red' : '#0003' }))
  .setStyles({
    width: '20px',
    height: '20px',
    marginRight: '10px',
  });

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
    .setStyles({ color: 'white', margin: '10px 5px', cursor: 'default' });

  return fabricate('Row')
    .setStyles({ alignItems: 'center' })
    .setChildren([
      backButton,
      deviceSegment,
      fabricate('Row')
        .setStyles({ position: 'absolute', right: '5px' })
        .setChildren([
          RebootButton(),
          ShutdownButton(),
        ]),
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
