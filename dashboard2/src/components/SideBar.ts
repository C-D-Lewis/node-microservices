import { Fabricate } from 'fabricate.js';
import { AppState, Device } from '../types';
import DeviceRow from './DeviceRow';
import { sortDeviceByName } from '../util';

declare const fabricate: Fabricate<AppState>;

/**
 * GroupContainer component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const GroupContainer = () => fabricate('div');

/**
 * GroupLabel component.
 *
 * @param {object} props - Component props.
 * @param {string} props.publicIp - IP address to show.
 * @returns {HTMLElement} Fabricate component.
 */
const GroupLabel = ({ publicIp }: { publicIp: string }) => fabricate('Text')
  .setStyles({
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  })
  .setText(publicIp);

/**
 * SideBar component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const SideBar = () => fabricate('Column')
  .setStyles(({ palette }) => ({
    backgroundColor: palette.grey2,
    width: '250px',
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
    el.setChildren(
      Object
        .entries(buckets)
        .map(([publicIp, devices]) => GroupContainer()
          .setChildren([
            GroupLabel({ publicIp }),
            ...devices
              .sort(sortDeviceByName)
              .map((device) => DeviceRow({ device })),
          ])),
    );
  }, ['fleet']);

export default SideBar;
