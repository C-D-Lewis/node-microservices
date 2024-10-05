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

  const nameView = fabricate('Text')
    .setStyles(({ fonts }) => ({
      color: 'white',
      fontSize: '1.2rem',
      fontFamily: fonts.code,
      fontWeight: 'bold',
    }))
    .setText(deviceName);

  return fabricate('Row')
    .setStyles(({ palette }) => ({
      backgroundColor: palette.grey2,
      padding: '8px 0px 8px 5px',
      cursor: 'pointer',
      minWidth: '240px',
    }))
    .setChildren([
      fabricate('Image', { src: `assets/images/${ICON_NAMES[deviceType]}.png` })
        .setStyles({ width: '32px', height: '32px' }),
      fabricate('Column')
        .setChildren([
          nameView,
        ]),
    ])
    .onHover((el, state, isHovered) => {
      el.setStyles(({ palette }) => ({
        backgroundColor: isHovered ? palette.grey3 : palette.grey2,
      }));
    })
    .onClick((el, state) => {
      // Show apps for device
    });
};

export default DeviceRow;
