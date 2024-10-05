import { Fabricate } from 'fabricate.js';
import { AppState, Device } from '../types';
import DeviceRow from './DeviceRow';
import { sortDeviceByName } from '../util';

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
    margin: '15px auto 8px auto',
  }))
  .setText(publicIp);

/**
 * SideBar component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const SideBar = () => fabricate('Column')
  .setStyles(({ palette }) => ({
    backgroundColor: palette.grey2,
    height: '95vh',
  }))
  .onUpdate(async (el, state) => {
    const { fleet } = state;

    // Sort fleet into publicIp buckets
    const buckets: Record<string, Device[]> = {};
    fleet.forEach((device) => {
      const { publicIp } = device;
      if (!buckets[publicIp]) {
        buckets[publicIp] = [];
      }

      buckets[publicIp].push(device);
    });

    // Group area for each bucket
    Object
      .entries(buckets)
      .forEach(([publicIp, devices]) => {
        el.addChildren([
          GroupLabel({ publicIp }),
          ...devices
            .sort(sortDeviceByName)
            .map((device) => DeviceRow({ device })),
        ]);
      });
  }, ['fleet']);

export default SideBar;
