/* global DeviceCard */

/**
 * FleetPage component.
 *
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const FleetPage = () => fab.Column()
  .watchState((el, { fleetList }) => {
    el.clear();
    el.addChildren([
      fab.Row()
        .withStyles({ flexWrap: 'wrap', padding: '10px' })
        .withChildren(fleetList.map((itemData) => DeviceCard({ itemData }))),
    ]);
  }, ['fleetList']);
