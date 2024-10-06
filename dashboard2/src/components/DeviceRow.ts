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
  const { deviceType, deviceName, localIp } = device;

  const nameView = fabricate('Text')
    .setStyles({
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: 'bold',
    })
    .setText(deviceName);
  const localIpView = fabricate('Text')
    .setStyles(({ fonts, palette }) => ({
      color: palette.greyC,
      fontSize: '1rem',
      fontFamily: fonts.code,
    }))
    .setText(localIp);

  return fabricate('Row')
    .setStyles(({ palette }) => ({
      backgroundColor: palette.grey3,
      padding: '4px 0px 4px 5px',
      cursor: 'pointer',
    }))
    .setChildren([
      fabricate('Image', { src: `assets/images/${ICON_NAMES[deviceType]}.png` })
        .setStyles({ width: '32px', height: '32px' }),
      fabricate('Column')
        .setChildren([nameView, localIpView]),
    ])
    .onHover((el, state, isHovered) => {
      el.setStyles(({ palette }) => ({
        backgroundColor: isHovered ? palette.grey4 : palette.grey3,
      }));
    })
    .onClick(() => {
      fabricate.update({ selectedDevice: device });
    });
};

export default DeviceRow;
