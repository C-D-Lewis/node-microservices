/**
 * FleetPage component.
 */
fabricate.declare('FleetPage', () => fabricate.Column()
  .watchState((el, { fleetList }) => {
    el.clear();
    el.addChildren([
      fabricate.Row()
        .withStyles({ flexWrap: 'wrap', padding: '10px' })
        .withChildren(fleetList.map((itemData) => fabricate('DeviceCard', { itemData }))),
    ]);
  }, ['fleetList']));
