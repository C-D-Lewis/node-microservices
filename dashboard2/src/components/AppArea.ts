import { Fabricate } from 'fabricate.js';
import { AppState } from '../types';
import InfoRow from './InfoRow';

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
 * AppArea component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const AppArea = () => fabricate('Column')
  .setStyles({ width: '100%' })
  .onUpdate(async (el, state) => {
    const { selectedDevice } = state;

    if (!selectedDevice) {
      el.setChildren([NoDeviceLabel()]);
    } else {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 200);
      el.setChildren([
        InfoRow({ device: selectedDevice }),
        // AppCards
      ]);
    }
  }, [fabricate.StateKeys.Created, 'selectedDevice']);

export default AppArea;
