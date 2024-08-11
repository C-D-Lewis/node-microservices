import { Fabricate, FabricateComponent } from 'fabricate.js';
import { ICON_NAMES } from '../constants';
import {
  AppState, Device, DeviceApp, IPType,
} from '../types';
import { getTimeAgoStr, isReachableKey } from '../utils';
import ItemPill from './ItemPill';
import { sendConduitPacket } from '../services/conduitService';
import IconButton from './IconButton';

declare const fabricate: Fabricate<AppState>;

/**
 * Send a device command by URL.
 *
 * @param {HTMLElement} el - This element.
 * @param {object} state - Current state.
 * @param {object} device - Device to command.
 * @param {string} topic - Command topic, either 'reboot' or 'shutdown'.
 */
const commandDevice = async (
  el: FabricateComponent<AppState>,
  state: AppState,
  device: Device,
  topic: string,
) => {
  const { deviceName } = device;
  const stateKey = fabricate.buildKey('command', topic);
  const pressed = !!state[stateKey];

  // Reset color regardless
  setTimeout(() => {
    el.setStyles(({ palette }) => ({ backgroundColor: palette.grey3 }));
    fabricate.update(stateKey, false);
  }, 2000);

  el.setStyles({ backgroundColor: !pressed ? 'red' : '#0003' });
  fabricate.update(stateKey, !pressed);
  if (!pressed) return;

  try {
    const { error } = await sendConduitPacket(state, { to: 'conduit', topic }, deviceName);
    if (error) throw new Error(error);

    console.log(`Device ${deviceName} sent ${topic} command`);
    el.setStyles(({ palette }) => ({ backgroundColor: palette.statusOk }));
  } catch (e) {
    alert(e);
    console.log(e);
  }
};

/**
 * ToolbarButton component.
 *
 * @param {object} props - Component props.
 * @param {string} props.src - Image src.
 * @returns {HTMLElement} Fabricate component.
 */
const ToolbarButton = ({ src }: { src: string }) => IconButton({ src })
  .setStyles({
    width: '20px',
    height: '20px',
    marginRight: '10px',
    transition: '0.5s',
  });

/**
 * RebootButton component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device.
 * @returns {HTMLElement} Fabricate component.
 */
const RebootButton = ({ device }: { device: Device }) => ToolbarButton({ src: 'assets/restart.png' })
  .onClick((el, state) => commandDevice(el, state, device, 'reboot'));

/**
 * ShutdownButton component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device.
 * @returns {HTMLElement} Fabricate component.
 */
const ShutdownButton = ({ device }: { device: Device }) => ToolbarButton({ src: 'assets/shutdown.png' })
  .setStyles({ marginRight: '0px' })
  .onClick((el, state) => commandDevice(el, state, device, 'shutdown'));

/**
 * DeviceName component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device.
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceName = ({ device }: { device: Device }) => fabricate('span')
  .setStyles({
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    padding: '2px 2px 0px 2px',
    fontFamily: 'monospace',
    cursor: 'pointer',
  })
  .setText(device.deviceName)
  .onClick(() => fabricate.update({
    page: 'AppsPage',
    selectedDevice: device,
  }));

/**
 * IpTextButton component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device.
 * @param {string} props.deviceIp - Device IP.
 * @param {string} props.type - Device type, 'local' or 'public'.
 * @returns {HTMLElement} Fabricate component.
 */
const LocalIpView = ({
  device,
  deviceIp,
  type,
}: {
  device: Device;
  deviceIp: string;
  type: IPType;
}) => {
  const { deviceName } = device;
  const reachableKey = isReachableKey(deviceName, type);

  const icon = fabricate('Image', { src: 'assets/local.png' })
    .setStyles({
      width: '18px',
      height: '18px',
      margin: '8px',
    });

  const textButton = fabricate('span')
    .setStyles(({ fonts }) => ({
      color: 'black',
      fontSize: '1rem',
      margin: '5px 0px',
      fontFamily: fonts.code,
    }))
    .setText(deviceIp)
    .onUpdate((el, state) => {
      const isReachable = state[reachableKey];

      el.setStyles(({ palette }) => ({
        color: isReachable
          ? palette.text
          : 'black',
        cursor: 'default',
      }));
    }, [reachableKey]);

  return fabricate('Row')
    .setStyles(({ palette }) => ({
      alignItems: 'center',
      borderBottom: `solid 1px ${palette.grey2}`,
    }))
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
    margin: '4px 4px 4px',
    width: '24px',
    height: '24px',
  });

/**
 * CardTitleRow component.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.seenRecently - If the device is recently updated and presumed to be alive.
 * @returns {HTMLElement} Fabricate component.
 */
const CardTitleRow = ({ seenRecently }: { seenRecently: boolean }) => fabricate('Row')
  .setStyles(({ palette }) => ({
    backgroundColor: seenRecently ? palette.instanceHealthy : palette.grey5,
    alignItems: 'center',
    height: '35px',
    padding: '3px 8px',
    boxShadow: '2px 2px 3px 1px #0006',
  }));

/**
 * DeviceCardContainer component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceCardContainer = () => fabricate('Card')
  .setStyles(({ palette }) => ({
    minWidth: '320px',
    maxWidth: '320px',
    minHeight: '150px',
    margin: '10px',
    boxShadow: '2px 2px 3px 1px #0004',
    backgroundColor: palette.grey3,
    height: 'fit-content',
  }));

/**
 * DeviceCardContainer component.
 *
 * @param {object} props - Component props.
 * @param {string} [props.commit] - Most recent commit short hash.
 * @param {string} [props.commitDate] - Most recent commit date.
 * @returns {HTMLElement} Fabricate component.
 */
const CommitView = ({ commit, commitDate }: { commit: string, commitDate: string }) => fabricate('Row')
  .setStyles(({ palette }) => ({
    alignItems: 'center',
    borderBottom: `solid 1px ${palette.grey2}`,
  }))
  .setChildren([
    fabricate('Image', { src: 'assets/commit.png' })
      .setStyles({
        width: '18px',
        height: '18px',
        margin: '8px',
      }),
    fabricate('Text')
      .setStyles(({ fonts }) => ({
        color: 'white',
        fontSize: '1rem',
        margin: '5px 0px',
        fontFamily: fonts.code,
        cursor: 'default',
      }))
      .setText(commit ? `${commit} (${getTimeAgoStr(new Date(commitDate).getTime())})` : 'Unknown'),
  ]);

/**
 * Last checkin label component.
 *
 * @param {object} props - Component props.
 * @param {number} props.lastCheckIn - Last seem minutes ago.
 * @returns {HTMLElement} Fabricate component.
 */
const LastSeenView = ({ lastCheckIn }: { lastCheckIn: number }) => fabricate('Row')
  .setStyles(({ palette }) => ({
    alignItems: 'center',
    borderBottom: `solid 1px ${palette.grey2}`,
  }))
  .setChildren([
    fabricate('Image', { src: 'assets/eye.png' })
      .setStyles({
        width: '18px',
        height: '18px',
        margin: '8px',
      }),
    fabricate('Text')
      .setStyles({
        color: 'white',
        fontSize: '0.9rem',
        margin: '5px 0px',
        cursor: 'default',
      })
      .setText(`${getTimeAgoStr(lastCheckIn)} ago`),
  ]);

/**
 * Disk usage label component.
 *
 * @param {object} props - Component props.
 * @param {string} props.diskSize - Disk size, such as '28G'.
 * @param {number} props.diskUsage - Percentage disk used, such as 10.
 * @returns {HTMLElement} Fabricate component.
 */
const DiskUsageView = ({ diskSize, diskUsage }: { diskSize: string, diskUsage: number }) => fabricate('Row')
  .setStyles(({ palette }) => ({
    alignItems: 'center',
    borderBottom: `solid 1px ${palette.grey2}`,
  }))
  .setChildren([
    fabricate('Image', { src: 'assets/disk.png' })
      .setStyles({
        width: '18px',
        height: '18px',
        margin: '8px',
      }),
    fabricate('Text')
      .setStyles({
        color: 'white',
        fontSize: '0.9rem',
        margin: '5px 0px',
        cursor: 'default',
      })
      .setText(`${diskUsage}% of ${diskSize} used`),
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
    localIp, commit, commitDate, lastCheckIn, diskSize, diskUsage,
  } = device;

  return fabricate('Column')
    .setStyles(({ palette }) => ({
      flex: '2',
      borderRight: `solid 1px ${palette.grey3}`,
    }))
    .setChildren([
      LocalIpView({
        device,
        deviceIp: localIp,
        type: 'local',
      }),
      CommitView({ commit, commitDate }),
      LastSeenView({ lastCheckIn }),
      DiskUsageView({ diskSize, diskUsage }),
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
    if (!apps || !apps.length) {
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
    } catch (err) { /* It isn't available */ }
  };

  return DeviceCardContainer()
    .setChildren([
      CardTitleRow({ seenRecently })
        .setChildren([
          DeviceIcon({ deviceType }),
          DeviceName({ device }),
          fabricate('Row')
            .setStyles({ marginLeft: 'auto' })
            .setChildren([
              RebootButton({ device }),
              ShutdownButton({ device }),
            ]),
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
