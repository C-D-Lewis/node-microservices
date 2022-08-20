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
 * IpTextButton component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const IpTextButton = ({ deviceName, ip, type }) => {
  const { key, get: isReachable } = fab.manageState(`FleetItem[${deviceName}]`, `${type}IpValid`, false);

  return fab('span')
    .withStyles({
      color: 'lightgrey',
      fontSize: '1rem',
      margin: '0px 12px',
      padding: '6px 5px',
      fontFamily: Fonts.code,
      cursor: 'pointer',
      borderLeft: '2px solid black',
    })
    .setText(ip)
    .watchState((el) => {
      // TODO: watchlist of [key] here breaks this for some reason
      el.addStyles({ color: isReachable() ? 'black' : 'lightgrey' });
    })
    .onClick(() => {
      // Select device, go to apps page
      fab.updateState('ip', () => ip);
      fab.updateState('page', () => 'AppsPage');
    });
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
  .withStyles({ margin: '4px' });

/**
 * Last checkin label component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const LastSeenLabel = ({ minsAgo }) => fab.Text()
  .withStyles({
    color: Colors.darkGrey,
    fontStyle: 'italic',
    fontSize: '0.9rem',
    textAlign: 'end',
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
 * FleetItem component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const FleetItem = ({ itemData }) => {
  const {
    deviceName, publicIp, localIp, deviceType = 'other', lastCheckIn,
  } = itemData;
  const publicIpValid = fab.manageState(`FleetItem[${deviceName}]`, 'publicIpValid', false);
  const localIpValid = fab.manageState(`FleetItem[${deviceName}]`, 'localIpValid', false);
  const isUnreachable = fab.manageState(`FleetItem[${deviceName}]`, 'unreachable', false);

  const minsAgo = Math.round((Date.now() - lastCheckIn) / (1000 * 60));
  const healthy = minsAgo < 11;  // Based on default checkin interval

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

  return fab.Card()
    .withStyles({ minWidth: '250px', margin: '10px' })
    .withChildren([
      fab.Row()
        .withStyles({
          backgroundColor: healthy ? Colors.instanceHealthy : Colors.veryDarkGrey,
          alignItems: 'center',
          borderBottom: '2px solid black',
          height: '30px',
        })
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
