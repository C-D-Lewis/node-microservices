/* global Fonts ICON_NAMES */

/**
 * DeviceName component.
 *
 * @returns {HTMLElement}
 */
const DeviceName = () => fab('span')
  .withStyles({
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1rem',
    padding: '2px 2px 0px 2px',
    cursor: 'default',
  });

/**
 * ConnectionIcon component.
 *
 * @returns {HTMLElement}
 */
const ConnectionIcon = () => fab.Image({
  src: 'assets/plug-off.png',
  width: '18px',
  height: '18px',
})
  .withStyles({ margin: '8px' });

/**
 * IpTextButton component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const IpTextButton = ({ deviceName, ip, type }) => {
  const { get: isReachable } = fab.manageState(`DeviceCard[${deviceName}]`, `${type}IpValid`, false);

  const icon = ConnectionIcon({ isReachable: false });

  return fab.Row()
    .withStyles({ alignItems: 'center', borderBottom: `solid 2px ${Colors.consoleGrey}` })
    .withChildren([
      icon,
      fab('span')
        .withStyles({
          color: 'lightgrey',
          fontSize: '1rem',
          margin: '5px 0px',
          fontFamily: Fonts.code,
          cursor: 'pointer',
        })
        .setText(ip)
        .watchState((el) => {
          // TODO: watchlist of [key] here breaks this for some reason
          el.addStyles({
            color: isReachable() ? Colors.IpTextButton.reachable : Colors.IpTextButton.unreachable,
          });
          icon.addAttributes({ src: `assets/plug${isReachable() ? '' : '-off'}.png` });
        })
        .onClick(() => {
          // Select device, go to apps page
          fab.updateState('ip', () => ip);
          fab.updateState('page', () => 'AppsPage');
        }),
    ]);
};

/**
 * DeviceIcon component.
 *
 * @returns {HTMLElement}
 */
const DeviceIcon = ({ deviceType }) => fab.Image({
  src: `assets/${ICON_NAMES[deviceType]}.png`,
  width: '20px',
  height: '20px',
})
  .withStyles({ margin: '4px 4px 4px 8px' });

/**
 * Last checkin label component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const LastSeenLabel = ({ minsAgo }) => fab.Text()
  .withStyles({
    color: Colors.AppCard.lastSeen,
    fontStyle: 'italic',
    fontSize: '0.9rem',
    textAlign: 'end',
    margin: '8px',
    marginTop: 'auto',
  })
  .then((el) => {
    if (minsAgo > (60 * 24)) {
      el.setText(`Last seen: ${Math.round(minsAgo / (60 * 24))} days ago`);
      return;
    }

    if (minsAgo > 60) {
      el.setText(`Last seen: ${Math.round(minsAgo / 60)} hours ago`);
      return;
    }

    el.setText(`Last seen: ${minsAgo} mins ago`);
  });

/**
 * Set if IpTextButton components.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const IpButtons = ({ deviceName, publicIp, localIp }) => fab.Column()
  .withChildren([
    IpTextButton({
      deviceName,
      ip: publicIp,
      type: 'public',
    }),
    IpTextButton({
      deviceName,
      ip: localIp,
      type: 'local',
    }),
  ]);

/**
 * CardTitle component.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isHealthy - If the device is recently updated and presumed to be alive.
 * @returns {HTMLElement}
 */
const CardTitle = ({ isHealthy }) => fab.Row()
  .withStyles({
    backgroundColor: isHealthy ? Colors.instanceHealthy : Colors.AppCard.titleBar,
    alignItems: 'center',
    height: '35px',
    boxShadow: '2px 2px 3px 1px #0006',
  });

/**
 * DeviceCardContainer component.
 *
 * @returns {HTMLElement}
 */
const DeviceCardContainer = () => fab.Card()
  .withStyles({
    minWidth: '300px',
    minHeight: '150px',
    margin: '10px',
    boxShadow: '2px 2px 3px 1px #0004',
    backgroundColor: Colors.DeviceCard.background,
  });

/**
 * DeviceCard component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const DeviceCard = ({ itemData }) => {
  const {
    deviceName, publicIp, localIp, deviceType = 'other', lastCheckIn,
  } = itemData;
  const publicIpValid = fab.manageState(`DeviceCard[${deviceName}]`, 'publicIpValid', false);
  const localIpValid = fab.manageState(`DeviceCard[${deviceName}]`, 'localIpValid', false);
  const isUnreachable = fab.manageState(`DeviceCard[${deviceName}]`, 'unreachable', false);

  const minsAgo = Math.round((Date.now() - lastCheckIn) / (1000 * 60));
  const isHealthy = minsAgo < 11;  // Based on default checkin interval

  /**
   * Test publicIp is reachable.
   */
  const testPublicIp = async () => {
    try {
      await fetch(`http://${publicIp}:5959/apps`);
      publicIpValid.set(true);
    } catch (err) { /* It isn't available */ }
  };

  /**
   * Test localIp is reachable.
   */
  const testLocalIp = async () => {
    try {
      await fetch(`http://${localIp}:5959/apps`);
      localIpValid.set(true);
    } catch (err) { /* It isn't available */ }
  };

  // Timeout
  setTimeout(() => {
    // At least one returned
    if (localIpValid.get() || publicIpValid.get()) return;

    isUnreachable.set(true);
  }, 5000);

  return DeviceCardContainer()
    .withChildren([
      CardTitle({ isHealthy })
        .withChildren([
          DeviceIcon({ deviceType }),
          DeviceName().setText(deviceName),
        ]),
      fab.when(
        (state) => state[publicIpValid.key] || state[localIpValid.key],
        () => IpButtons({ deviceName, publicIp, localIp }),
      ),
      fab.when(
        (state) => (
          !state[publicIpValid.key] && !state[localIpValid.key] && !state[isUnreachable.key]
        ),
        () => fab.Loader().withStyles({ margin: 'auto', marginTop: '10px' }),
      ),
      // TODO: fab.until(state, builderBefore, builderAfter)
      LastSeenLabel({ minsAgo }),
    ])
    .then(() => {
      testPublicIp();
      testLocalIp();
    });
};
