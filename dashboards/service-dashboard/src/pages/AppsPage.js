/**
 * AppsPage component.
 */
fabricate.declare('AppsPage', () => fabricate('Row')
  .setStyles({
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    paddingTop: '15px',
  })
  .onUpdate((el, { selectedDevice, deviceApps }) => {
    if (!selectedDevice) return;

    const apps = deviceApps[selectedDevice.deviceName];
    el.setChildren(apps.map(({ app }) => fabricate('AppCard', { app })));
  }, ['selectedDevice', 'deviceApps']));
