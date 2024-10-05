import { Fabricate } from 'fabricate.js';
import { AppState, Device } from '../types';
import { ICON_NAMES } from '../constants';

declare const fabricate: Fabricate<AppState>;

/**
 * DeviceRow component.
 *
 * @param {object} props - Component pros.
 * @param {Device} props.device - Device being shown.
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceRow = ({ device }: { device: Device }) => {
  const { deviceType, deviceName } = device;

  return fabricate('Row')
    .setStyles(({ palette }) => ({
      backgroundColor: palette.grey3,
      width: '100%',
      margin: '8px',
    }))
    .setChildren([
      fabricate('Image', { src: `assets/images/${ICON_NAMES[deviceType]}.png` })
        .setStyles({
          width: '32px',
          height: '32px',
        }),
      fabricate('Column')
        .setChildren([
          fabricate('Text')
            .setStyles({
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            })
            .setText(deviceName),
        ]),
    ]);
};

export default DeviceRow;
