import { Fabricate } from 'fabricate.js';
import { AppState, Device } from '../types.ts';
import { sortDeviceByName } from '../util.ts';
import { ICON_NAMES } from '../constants.ts';
import AppLoader from './AppLoader.ts';
import { fetchDeviceApps } from '../services/conduitService.ts';
import Theme from '../theme.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * GroupLabel component.
 *
 * @param {object} props - Component props.
 * @param {string} props.publicIp - IP address to show.
 * @returns {HTMLElement} Fabricate component.
 */
const GroupLabel = ({ publicIp }: { publicIp: string }) => fabricate('Text')
  .setStyles(({ palette, fonts }) => ({
    color: palette.greyC,
    fontSize: '1rem',
    fontFamily: fonts.code,
    fontWeight: 'bold',
    padding: '15px 0px 8px 5px',
    textAlign: 'center',
    backgroundColor: palette.grey2,
    margin: '0px',
    cursor: 'default',
  }))
  .setText(publicIp);

/**
 * DeviceRow component.
 *
 * @param {object} props - Component pros.
 * @param {Device} props.device - Device being shown.
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceRow = ({ device }: { device: Device }) => {
  const {
    deviceType, deviceName, localIp, lastCheckIn, caseColor,
  } = device;

  const minsAgo = Math.round((Date.now() - lastCheckIn) / (1000 * 60));
  const seenRecently = minsAgo < 12;  // Based on default checkin interval of 10m
  const statusColor = seenRecently ? Theme.palette.statusOk : Theme.palette.grey6;

  const nameView = fabricate('Text')
    .setStyles({
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: 'bold',
    })
    .setText(deviceName);
  const localIpView = fabricate('Text')
    .setStyles(({ fonts }) => ({
      color: statusColor,
      fontSize: '1rem',
      fontFamily: fonts.code,
    }))
    .setText(localIp);

  /**
   * Determine if this is the selected device.
   *
   * @param {AppState} s Current state.
   * @returns {boolean} true if this is the selected device.
   */
  const isSelected = (s: AppState) => s.selectedDevice?.deviceName === deviceName;

  return fabricate('Row')
    .setStyles(({ palette }) => ({
      backgroundColor: palette.grey3,
      padding: '4px 0px 4px 8px',
      cursor: 'pointer',
      borderBottom: `solid 2px ${palette.grey6}`,
      borderLeft: `solid 8px ${caseColor || '#0000'}`,
    }))
    .setChildren([
      fabricate('Image', { src: `assets/images/${ICON_NAMES[deviceType]}.png` })
        .setStyles({ width: '32px', height: '32px' }),
      fabricate('Column')
        .setChildren([nameView, localIpView]),
    ])
    .onHover((el, state, isHovered) => {
      if (isSelected(state)) return;

      el.setStyles(({ palette }) => ({
        backgroundColor: isHovered ? palette.grey4 : palette.grey3,
      }));
    })
    .onClick((el, state) => {
      // Select this device
      fabricate.update({ selectedDevice: device });

      // Load the app details
      fetchDeviceApps(state, device);
    })
    .onUpdate((el, state) => {
      el.setStyles(({ palette }) => ({
        backgroundColor: isSelected(state) ? palette.grey4 : palette.grey3,
      }));
    }, ['selectedDevice']);
};

/**
 * SideBar component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const SideBar = () => fabricate('Column')
  .setStyles(({ palette }) => ({
    backgroundColor: palette.grey3,
    minWidth: '250px',
  }))
  .setNarrowStyles({ width: '100vw' })
  .onUpdate(async (el, state) => {
    const { devices } = state;

    if (!devices.length) {
      el.setChildren([AppLoader()]);
      return;
    }

    // Sort devices into publicIp buckets
    const buckets: Record<string, Device[]> = {};
    devices.forEach((device) => {
      const { publicIp } = device;
      if (!buckets[publicIp]) {
        buckets[publicIp] = [];
      }

      buckets[publicIp].push(device);
    });

    // Group area for each bucket
    el.empty();
    Object
      .entries(buckets)
      .forEach(([publicIp, groupDevices]) => {
        el.addChildren([
          GroupLabel({ publicIp }),
          ...groupDevices
            .sort(sortDeviceByName)
            .map((device) => DeviceRow({ device })),
        ]);
      });
  }, ['devices']);

export default SideBar;
