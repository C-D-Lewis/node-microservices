import { Fabricate, FabricateComponent } from 'fabricate.js';
import { ICON_NAMES } from '../constants';
import Theme from '../theme';
import {
  AppState, Device, DeviceApp, IPType,
} from '../types';
import { getTimeAgoStr, isReachableKey } from '../utils';
import ItemPill from './ItemPill';

declare const fabricate: Fabricate<AppState>;

/**
 * DeviceName component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceName = () => fabricate('span')
  .setStyles({
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1rem',
    padding: '2px 2px 0px 2px',
    fontFamily: 'monospace',
  });

/**
 * ConnectionIcon component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ConnectionIcon = () => fabricate('Image', { src: 'assets/plug-off.png' })
  .setStyles({
    width: '18px',
    height: '18px',
    margin: '8px',
  });

/** IpText prop types */
type IpTextPropTypes = {
  device: Device;
  deviceIp: string;
  type: IPType;
}

/**
 * IpTextButton component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device name.
 * @param {string} props.deviceIp - Device IP.
 * @param {string} props.type - Device type, 'local' or 'public'.
 * @returns {HTMLElement} Fabricate component.
 */
const IpText = ({ device, deviceIp, type }: IpTextPropTypes) => {
  const { deviceName } = device;
  const reachableKey = isReachableKey(deviceName, type);

  const icon = ConnectionIcon().setAttributes({ src: `assets/${type}.png` });

  const textButton = fabricate('span')
    .setStyles({
      color: 'lightgrey',
      fontSize: '1rem',
      margin: '5px 0px',
      fontFamily: Theme.fonts.code,
    })
    .setText(deviceIp)
    .onUpdate((el, state) => {
      const isReachable = state[reachableKey];

      el.setStyles({
        color: isReachable
          ? Theme.palette.text
          : Theme.palette.grey2,
        cursor: 'default',
      });
    }, [reachableKey]);

  return fabricate('Row')
    .setStyles({ alignItems: 'center', borderBottom: `solid 1px ${Theme.palette.grey2}` })
    .setChildren([icon, textButton]);
};

/**
 * DeviceIcon component.
 *
 * @param {object} props - Component props.
 * @param {string} props.deviceType - Device type.
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceIcon = ({ deviceType }: { deviceType: string }) => fabricate('Image', { src: `assets/${ICON_NAMES[deviceType]}.png` })
  .setStyles({
    margin: '4px 4px 4px 8px',
    width: '20px',
    height: '20px',
  });

/**
 * Last checkin label component.
 *
 * @param {object} props - Component props.
 * @param {number} props.lastCheckIn - Last seem minutes ago.
 * @returns {HTMLElement} Fabricate component.
 */
const LastSeenLabel = ({ lastCheckIn }: { lastCheckIn: number }) => fabricate('Text')
  .setStyles({
    color: Theme.palette.lightGrey,
    fontStyle: 'italic',
    fontSize: '0.9rem',
    textAlign: 'end',
    margin: '8px',
    paddingTop: '10px',
    marginTop: 'auto',
  })
  .setText(`${getTimeAgoStr(lastCheckIn)} ago`);

/**
 * CardTitle component.
 *
 * @param {object} props - Component props.
 * @param {Device} props.device - Selected device.
 * @param {boolean} props.seenRecently - If the device is recently updated and presumed to be alive.
 * @returns {HTMLElement} Fabricate component.
 */
const CardTitle = ({ device, seenRecently }: { device: Device, seenRecently: boolean }) => fabricate('Row')
  .setStyles({
    backgroundColor: seenRecently ? Theme.palette.instanceHealthy : Theme.palette.grey5,
    alignItems: 'center',
    height: '35px',
    boxShadow: '2px 2px 3px 1px #0006',
    cursor: 'pointer',
  })
  .onClick(() => fabricate.update({
    page: 'AppsPage',
    selectedDevice: device,
  }));

/**
 * DeviceCardContainer component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceCardContainer = () => fabricate('Card')
  .setStyles({
    minWidth: '320px',
    maxWidth: '320px',
    minHeight: '150px',
    margin: '10px',
    boxShadow: '2px 2px 3px 1px #0004',
    backgroundColor: Theme.palette.grey3,
  });

/**
 * DeviceCardContainer component.
 *
 * @param {object} props - Component props.
 * @param {string} [props.commit] - Most recent commit short hash.
 * @param {string} [props.commitDate] - Most recent commit date.
 * @returns {HTMLElement} Fabricate component.
 */
const CommitView = ({ commit, commitDate }: { commit: string, commitDate: string }) => fabricate('Row')
  .setStyles({ alignItems: 'center', borderBottom: `solid 1px ${Theme.palette.grey2}` })
  .setChildren([
    fabricate('Image', { src: 'assets/commit.png' })
      .setStyles({
        width: '18px',
        height: '18px',
        margin: '8px',
      }),
    fabricate('Text')
      .setStyles({
        color: 'white',
        fontSize: '1rem',
        margin: '5px 0px',
        fontFamily: Theme.fonts.code,
        cursor: 'default',
      })
      .setText(commit ? `${commit} (${getTimeAgoStr(new Date(commitDate).getTime())})` : 'Unknown'),
  ]);

/**
 * DeviceDetailsColumn component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device for these details.
 * @returns {HTMLElement} DeviceDetailsColumn component.
 */
const DeviceDetailsColumn = ({ device }: { device: Device }) => {
  const {
    publicIp, localIp, commit, commitDate,
  } = device;

  return fabricate('Column')
    .setStyles({ flex: '2', borderRight: `solid 1px ${Theme.palette.grey3}` })
    .setChildren([
      IpText({
        device,
        deviceIp: publicIp,
        type: 'public',
      }),
      IpText({
        device,
        deviceIp: localIp,
        type: 'local',
      }),
      CommitView({ commit, commitDate }),
    ]);
};

/**
 * AppChipList component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device for this app list.
 * @returns {HTMLElement} AppChipList component.
 */
const AppChipList = ({ device }: { device: Device }) => {
  const { deviceName } = device;

  /**
   * Update the layout.
   *
   * @param {FabricateComponent} el - Page element.
   * @param {AppState} state - App state.
   */
  const updateLayout = (el: FabricateComponent<AppState>, state: AppState) => {
    const { deviceApps } = state;
    const apps = deviceApps[deviceName];
    if (!apps) {
      el.setChildren([
        fabricate('Loader').setStyles({ margin: 'auto' }),
      ]);
      return;
    }

    try {
      el.setChildren(apps.map((app: DeviceApp) => ItemPill({
        src: 'assets/app.png',
        text: app.app!,
      })));
    } catch (e: unknown) {
      console.log(e);
    }
  };

  return fabricate('Row')
    .setStyles({
      flex: '3',
      flexWrap: 'wrap',
      alignContent: 'flex-start',
      padding: '5px',
    })
    .onCreate(updateLayout)
    .onUpdate(updateLayout, ['deviceApps']);
};

/**
 * DeviceCard component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device for this card.
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceCard = ({ device }: { device: Device }) => {
  const {
    deviceName, publicIp, localIp, lastCheckIn, deviceType,
  } = device;
  const publicIpValidKey = isReachableKey(deviceName, 'public');
  const localIpValidKey = isReachableKey(deviceName, 'local');

  const minsAgo = Math.round((Date.now() - lastCheckIn) / (1000 * 60));
  const seenRecently = minsAgo < 12;  // Based on default checkin interval of 10m

  /**
   * Test IP is reachable.
   *
   * @param {string} ip - IP to use.
   * @param {string} stateKey - State to update.
   */
  const testIp = async (ip: string, stateKey: string) => {
    try {
      await fetch(`http://${ip}:5959/ping`);
      fabricate.update(stateKey, true);

      // TODO: Fetch local apps now?
    } catch (err) { /* It isn't available */ }
  };

  return DeviceCardContainer()
    .setChildren([
      CardTitle({ device, seenRecently })
        .setChildren([
          DeviceIcon({ deviceType }),
          DeviceName().setText(deviceName),
          LastSeenLabel({ lastCheckIn }),
        ]),
      DeviceDetailsColumn({ device }),
      AppChipList({ device }),
    ])
    .onCreate(() => {
      testIp(publicIp, publicIpValidKey);
      testIp(localIp, localIpValidKey);
    });
};

export default DeviceCard;
