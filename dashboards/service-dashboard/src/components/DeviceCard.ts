import { Fabricate } from "../../node_modules/fabricate.js/types/fabricate";
import { ICON_NAMES } from "../constants";
import Theme from "../theme";
import { AppState, Device, DeviceApp, IPType } from "../types";
import { getTimeAgoStr, isReachableKey } from "../utils";
import ItemPill from "./ItemPill";
import TextButton from "./TextButton";

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
    cursor: 'default',
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
      // TODO: watchlist of [key] here breaks this for some reason
      const isReachable = state[reachableKey];

      el.setStyles({
        color: isReachable
          ? Theme.colors.IpTextButton.reachable
          : Theme.colors.IpTextButton.unreachable,
        cursor: 'default',
      });
    });

  return fabricate('Row')
    .setStyles({ alignItems: 'center', borderBottom: `solid 1px ${Theme.colors.consoleGrey}` })
    .setChildren([icon, textButton]);
};

/**
 * DeviceIcon component.
 *
 * @param {object} props - Component props.
 * @param {string} props.deviceType - Device type.
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceIcon = ({ deviceType }: { deviceType: string }) =>
  fabricate('Image', { src: `assets/${ICON_NAMES[deviceType]}.png` })
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
    color: Theme.colors.AppCard.lastSeen,
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
 * @param {boolean} props.seenRecently - If the device is recently updated and presumed to be alive.
 * @returns {HTMLElement} Fabricate component.
 */
const CardTitle = ({ seenRecently }: { seenRecently: boolean }) => fabricate('Row')
  .setStyles({
    backgroundColor: seenRecently ? Theme.colors.instanceHealthy : Theme.colors.AppCard.titleBar,
    alignItems: 'center',
    height: '35px',
    boxShadow: '2px 2px 3px 1px #0006',
  });

/**
 * DeviceCardContainer component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceCardContainer = () => fabricate('Card')
  .setStyles({
    minWidth: '550px',
    maxWidth: '550px',
    minHeight: '150px',
    margin: '10px',
    boxShadow: '2px 2px 3px 1px #0004',
    backgroundColor: Theme.colors.DeviceCard.background,
  });

/**
 * DeviceCardContainer component.
 *
 * @param {object} props - Component props.
 * @param {string} [props.commit] - Most recent commit short hash.
 * @param {string} [props.commitDate] - Most recent commit date.
 * @returns {HTMLElement} Fabricate component.
 */
const CommitView = ({ commit, commitDate }: { commit: string, commitDate: string }) =>
  fabricate('Row')
    .setStyles({ alignItems: 'center', borderBottom: `solid 1px ${Theme.colors.consoleGrey}` })
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
    .setStyles({ flex: 2, borderRight: `solid 1px ${Theme.colors.consoleGrey}` })
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
      TextButton()
        .setText('Select')
        .setStyles({
          margin: 0,
          width: 'auto',
          borderRadius: 0,
        })
        .onClick(() => {
          fabricate.update({
            page: 'AppsPage',
            selectedDevice: device,
          });
        }),
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

  return fabricate('Row')
    .setStyles({
      flex: 3,
      flexWrap: 'wrap',
      alignContent: 'flex-start',
      padding: '5px',
    })
    .onUpdate((el, { deviceApps }) => {
      const apps = deviceApps[deviceName];
      if (!apps) {
        el.setChildren([
          fabricate('Loader').setStyles({ margin: 'auto' }),
        ]);
        return;
      }

      el.setChildren(apps.map((app: DeviceApp) => ItemPill({
          src: 'assets/app.png',
          text: app.app!,
        })));
    }, ['deviceApps']);
};

/**
 * DeviceCard component.
 *
 * @param {object} props - Component props.
 * @param {object} props.state - App state.
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
      CardTitle({ seenRecently })
        .setChildren([
          DeviceIcon({ deviceType }),
          DeviceName().setText(deviceName),
          LastSeenLabel({ lastCheckIn }),
        ]),
      fabricate('Row')
        .setChildren([
          DeviceDetailsColumn({ device }),
          AppChipList({ device }),
        ]),
    ])
    .onCreate(() => {
      testIp(publicIp, publicIpValidKey);
      testIp(localIp, localIpValidKey);
    });
};

export default DeviceCard;
