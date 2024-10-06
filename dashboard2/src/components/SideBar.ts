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
    padding: '15px 0px 8px 5px',
    textAlign: 'center',
    backgroundColor: palette.grey2,
    margin: '0px',
  }))
  .setText(publicIp);

/**
 * SideBar component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const SideBar = () => fabricate('Column')
  .setStyles(({ palette }) => ({
    backgroundColor: palette.grey3,
    minWidth: '240px',
  }))
  .setNarrowStyles({ width: '100vw' })
  .onUpdate(async (el, state) => {
    const { fleet } = state;

    if (!fleet.length) {
      el.setChildren([
        fabricate('Loader', {
          size: 48,
          color: 'white',
          backgroundColor: '#0000',
        })
          .setStyles({ margin: '10px auto' }),
      ]);
      return;
    }

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
    el.empty();
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
