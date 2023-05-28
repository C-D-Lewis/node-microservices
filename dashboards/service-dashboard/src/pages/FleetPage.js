/**
 * FleetPage component.
 */
fabricate.declare('FleetPage', () => fabricate('Column')
  .onUpdate((el, { fleetList }) => {
    el.setChildren([
      fabricate('Row')
        .setStyles({ flexWrap: 'wrap', padding: '10px' })
        .setChildren(fleetList.map((device) => fabricate('DeviceCard', { device }))),
    ]);
  }, ['fleetList']));
