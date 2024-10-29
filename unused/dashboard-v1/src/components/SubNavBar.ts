import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState } from '../types';
import { getReachableIp } from '../utils';

declare const fabricate: Fabricate<AppState>;

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
    .onClick(async () => {
      // TODO: Why await needed here?
      await fabricate.update({ page: 'FleetPage' });
    });

  const deviceSegment = fabricate('p')
    .setStyles({ color: 'white', margin: '10px 5px', cursor: 'default' });

  /**
   * Update the layout.
   *
   * @param {FabricateComponent} el - Page element.
   * @param {AppState} state - App state.
   */
  const updateLayout = (el: FabricateComponent<AppState>, state: AppState) => {
    const { fleet, selectedDevice } = state;
    if (selectedDevice === null) return;

    const found = fleet.find(({ deviceName }) => deviceName === selectedDevice.deviceName);
    if (found) deviceSegment.setText(`< ${found.deviceName} (${getReachableIp(state)})`);
  };

  return fabricate('Row')
    .setStyles({ alignItems: 'center' })
    .setChildren([
      backButton,
      deviceSegment,
    ])
    .onCreate(updateLayout)
    .onUpdate(updateLayout, ['fleet', 'selectedDevice']);
};

/**
 * SubNavBar component.
 *
 * @returns {FabricateComponent} SubNavBar component.
 */
const SubNavBar = () => fabricate('Row')
  .setStyles(({ palette }) => ({
    backgroundColor: palette.grey3,
    paddingLeft: '8px',
    boxShadow: '2px 2px 3px 1px #0004',
  }))
  .setChildren([
    fabricate.conditional(({ page }) => page === 'FleetPage', AllDevicesBreadcrumb),
    fabricate.conditional(({ page }) => page === 'AppsPage', BackBreadcrumb),
  ]);

export default SubNavBar;
