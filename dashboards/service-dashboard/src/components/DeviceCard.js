/* global Theme Constants */

/**
 * DeviceName component.
 *
 * @returns {HTMLElement}
 */
const DeviceName = () => fabricate('span')
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
const ConnectionIcon = () => fabricate.Image({
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
  const { get: isReachable } = fabricate.manageState(`DeviceCard[${deviceName}]`, `${type}IpValid`, false);

  const icon = ConnectionIcon({ isReachable: false });

  const textButton = fabricate('span')
    .withStyles({
      color: 'lightgrey',
      fontSize: '1rem',
      margin: '5px 0px',
      fontFamily: Theme.fonts.code,
      cursor: 'pointer',
    })
    .setText(ip)
    .watchState((el) => {
      // TODO: watchlist of [key] here breaks this for some reason
      el.addStyles({
        color: isReachable()
          ? Theme.colors.IpTextButton.reachable
          : Theme.colors.IpTextButton.unreachable,
      });
      icon.addAttributes({ src: `assets/plug${isReachable() ? '' : '-off'}.png` });
    })
    .onClick(() => {
      // Select device, go to apps page
      fabricate.updateState('ip', () => ip);
      fabricate.updateState('page', () => 'AppsPage');
    });

  return fabricate.Row()
    .withStyles({ alignItems: 'center', borderBottom: `solid 2px ${Theme.colors.consoleGrey}` })
    .withChildren([
      icon,
      textButton,
    ]);
};

/**
 * DeviceIcon component.
 *
 * @returns {HTMLElement}
 */
const DeviceIcon = ({ deviceType }) => fabricate.Image({
  src: `assets/${Constants.ICON_NAMES[deviceType]}.png`,
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
const LastSeenLabel = ({ minsAgo }) => fabricate.Text()
  .withStyles({
    color: Theme.colors.AppCard.lastSeen,
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
const IpButtons = ({ deviceName, publicIp, localIp }) => fabricate.Column()
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
const CardTitle = ({ isHealthy }) => fabricate.Row()
  .withStyles({
    backgroundColor: isHealthy ? Theme.colors.instanceHealthy : Theme.colors.AppCard.titleBar,
    alignItems: 'center',
    height: '35px',
    boxShadow: '2px 2px 3px 1px #0006',
  });

/**
 * DeviceCardContainer component.
 *
 * @returns {HTMLElement}
 */
const DeviceCardContainer = () => fabricate.Card()
  .withStyles({
    minWidth: '300px',
    minHeight: '150px',
    margin: '10px',
    boxShadow: '2px 2px 3px 1px #0004',
    backgroundColor: Theme.colors.DeviceCard.background,
  });

/**
 * DeviceCard component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
fabricate.declare('DeviceCard', ({ itemData }) => {
  const {
    deviceName, publicIp, localIp, deviceType = 'other', lastCheckIn,
  } = itemData;
  const publicIpValid = fabricate.manageState(`DeviceCard[${deviceName}]`, 'publicIpValid', false);
  const localIpValid = fabricate.manageState(`DeviceCard[${deviceName}]`, 'localIpValid', false);
  const isUnreachable = fabricate.manageState(`DeviceCard[${deviceName}]`, 'unreachable', false);

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
      fabricate.when(
        (state) => state[publicIpValid.key] || state[localIpValid.key],
        () => IpButtons({ deviceName, publicIp, localIp }),
      ),
      fabricate.when(
        (state) => (
          !state[publicIpValid.key] && !state[localIpValid.key] && !state[isUnreachable.key]
        ),
        () => fabricate.Loader().withStyles({ margin: 'auto', marginTop: '10px' }),
      ),
      // TODO: fabricate.until(state, builderBefore, builderAfter)
      LastSeenLabel({ minsAgo }),
    ])
    .then(() => {
      testPublicIp();
      testLocalIp();
    });
});
