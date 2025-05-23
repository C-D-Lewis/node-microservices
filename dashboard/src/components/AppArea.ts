import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState } from '../types.ts';
import StatRow from './StatRow.ts';
import AppLoader from './AppLoader.ts';
import DeviceMetrics from './DeviceMetrics.ts';
import { fetchMetricNames } from '../services/conduitService.ts';
import VisualsPalette from './VisualsPalette.ts';
import AppCardList from './AppCardList.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * NoDeviceLabel component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const NoDeviceLabel = () => fabricate('Text')
  .setStyles(({ palette }) => ({
    color: palette.grey5,
    margin: 'auto',
    cursor: 'default',
  }))
  .setText('No device selected');

/**
 * RefreshProgressBar component.
 *
 * @returns {FabricateComponent} RefreshProgressBar component.
 */
const RefreshProgressBar = () => {
  let handle: NodeJS.Timer;
  let progress = 100;

  return fabricate('div')
    .setStyles(({ palette }) => ({
      width: '100%',
      height: '5px',
      backgroundColor: palette.secondary,
      transition: '0.5s',
    }))
    .onCreate((el, state) => {
      handle = setInterval(() => {
        el.setStyles({ width: `${progress}%` });

        // 30s
        progress = Math.max(0, progress - 1.67);
        if (progress === 0) {
          progress = 100;

          fetchMetricNames(state);
        }
      }, 1000);
    })
    .onDestroy(() => clearInterval(handle));
};

/**
 * AppArea component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const AppArea = () => {
  /**
   * Determine if this device's apps are loaded.
   *
   * @param {AppState} s - App state.
   * @returns {boolean} true if apps are loaded
   */
  const areAppsLoaded = (s: AppState) => !!s.selectedDeviceApps?.length;

  return fabricate('Column')
    .setStyles({ width: '100%' })
    .onUpdate(async (el, state) => {
      const { selectedDevice } = state;

      if (!selectedDevice) {
        el.setChildren([NoDeviceLabel()]);
        return;
      }

      setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 200);
      el.setChildren([
        StatRow({ device: selectedDevice }),
        fabricate.conditional((s) => !areAppsLoaded(s), AppLoader),
        fabricate.conditional(areAppsLoaded, RefreshProgressBar),
        fabricate.conditional(areAppsLoaded, DeviceMetrics),
        fabricate.conditional(areAppsLoaded, VisualsPalette),
        fabricate.conditional(areAppsLoaded, AppCardList),
      ]);
    }, [fabricate.StateKeys.Created, 'selectedDevice']);
};

export default AppArea;
