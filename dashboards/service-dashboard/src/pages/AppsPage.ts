import { Fabricate, FabricateComponent } from 'fabricate.js';
import AppCard from '../components/AppCard';
import { AppState } from '../types';

declare const fabricate: Fabricate<AppState>;

/**
 * AppsPage component.
 *
 * @returns {FabricateComponent} AppsPage component.
 */
const AppsPage = () => {
  /**
   * Update the layout.
   *
   * @param {FabricateComponent} el - Page element.
   * @param {AppState} state - App state.
   */
  const updateLayout = (el: FabricateComponent<AppState>, state: AppState) => {
    const { selectedDevice, deviceApps } = state;
    if (!selectedDevice) return;

    const apps = deviceApps[selectedDevice.deviceName];
    el.setChildren(apps.map((app) => AppCard({ app: app.app! })));
  };

  return fabricate('Row')
    .setStyles({
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      paddingTop: '15px',
    })
    .onCreate(updateLayout)
    .onUpdate(updateLayout, ['selectedDevice', 'deviceApps']);
};

export default AppsPage;
