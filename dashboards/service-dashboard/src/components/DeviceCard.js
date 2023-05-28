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

/**
 * IpTextButton component.
 *
 * @param {object} props - Component props.
 * @param {string} props.deviceName - Device name.
 * @param {string} props.deviceIp - Device IP.
 * @param {string} props.type - Device type, 'local' or 'public'.
 * @returns {HTMLElement} Fabricate component.
 */
const IpTextButton = ({ deviceName, deviceIp, type }) => {
  const isReachableKey = Utils.isReachableKey(deviceName, type);

  const icon = ConnectionIcon({ isReachable: false }).setAttributes({ src: `assets/${type}.png` });

  const textButton = fabricate('span')
    .setStyles({
      color: 'lightgrey',
      fontSize: '1rem',
      margin: '5px 0px',
      fontFamily: Theme.fonts.code,
      cursor: 'pointer',
    })
    .setText(deviceIp)
    .onUpdate((el, state) => {
      // TODO: watchlist of [key] here breaks this for some reason
      el.setStyles({
        color: state[isReachableKey]
          ? Theme.colors.IpTextButton.reachable
          : Theme.colors.IpTextButton.unreachable,
      });
    })
    .onClick(() => {
      // Select device, go to apps page
      fabricate.update({ selectedIp: deviceIp, page: 'AppsPage', selectedDeviceName: deviceName });
    });

  return fabricate('Row')
    .setStyles({ alignItems: 'center', borderBottom: `solid 2px ${Theme.colors.consoleGrey}` })
    .setChildren([icon, textButton]);
};

/**
 * DeviceIcon component.
 *
 * @param {object} props - Component props.
 * @param {string} props.deviceType - Device type.
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceIcon = ({ deviceType }) => fabricate('Image', { src: `assets/${Constants.ICON_NAMES[deviceType]}.png` })
  .setStyles({
    margin: '4px 4px 4px 8px',
    width: '20px',
    height: '20px',
  });

/**
 * Last checkin label component.
 *
 * @param {object} props - Component props.
 * @param {number} props.minsAgo - Last seem minutes ago.
 * @returns {HTMLElement} Fabricate component.
 */
const LastSeenLabel = ({ minsAgo }) => fabricate('Text')
  .setStyles({
    color: Theme.colors.AppCard.lastSeen,
    fontStyle: 'italic',
    fontSize: '0.9rem',
    textAlign: 'end',
    margin: '8px',
    marginTop: 'auto',
  })
  .onCreate((el) => {
    if (minsAgo > (60 * 24)) {
      el.setText(`Last seen ${Math.round(minsAgo / (60 * 24))} days ago`);
      return;
    }

    if (minsAgo > 60) {
      el.setText(`Last seen ${Math.round(minsAgo / 60)} hours ago`);
      return;
    }

    el.setText(`Last seen ${minsAgo} mins ago`);
  });

/**
 * Set if IpTextButton components.
 *
 * @param {object} props - Component props.
 * @param {string} props.deviceName - Device name.
 * @param {string} props.publicIp - Public IP.
 * @param {string} props.localIp - Local IP.
 * @returns {HTMLElement} Fabricate component.
 */
const IpButtons = ({ deviceName, publicIp, localIp }) => fabricate('Column')
  .setChildren([
    IpTextButton({
      deviceName,
      deviceIp: publicIp,
      type: 'public',
    }),
    IpTextButton({
      deviceName,
      deviceIp: localIp,
      type: 'local',
    }),
  ]);

/**
 * CardTitle component.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isHealthy - If the device is recently updated and presumed to be alive.
 * @returns {HTMLElement} Fabricate component.
 */
const CardTitle = ({ isHealthy }) => fabricate('Row')
  .setStyles({
    backgroundColor: isHealthy ? Theme.colors.instanceHealthy : Theme.colors.AppCard.titleBar,
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
 * @returns {HTMLElement} Fabricate component.
 */
fabricate.declare('DeviceCard', ({ device }) => {
  const {
    deviceName, publicIp, localIp, deviceType = 'other', lastCheckIn,
  } = device;
  const publicIpValidKey = Utils.isReachableKey(deviceName, 'public');
  const localIpValidKey = Utils.isReachableKey(deviceName, 'local');
  const isUnreachableKey = Utils.isReachableKey(deviceName, 'isUnreachable');

  const minsAgo = Math.round((Date.now() - lastCheckIn) / (1000 * 60));
  const isHealthy = minsAgo < 11;  // Based on default checkin interval of 10m

  /**
   * Test publicIp is reachable.
   */
  const testPublicIp = async () => {
    try {
      await fetch(`http://${publicIp}:5959/apps`);
      fabricate.update(publicIpValidKey, true);
    } catch (err) { /* It isn't available */ }
  };

  /**
   * Test localIp is reachable.
   */
  const testLocalIp = async () => {
    try {
      await fetch(`http://${localIp}:5959/apps`);
      fabricate.update(localIpValidKey, true);
    } catch (err) { /* It isn't available */ }
  };

  return DeviceCardContainer()
    .setChildren([
      CardTitle({ isHealthy })
        .setChildren([
          DeviceIcon({ deviceType }),
          DeviceName().setText(deviceName),
        ]),
      IpButtons({ deviceName, publicIp, localIp })
        .when((state) => state[publicIpValidKey] || state[localIpValidKey]),
      fabricate('Loader')
        .setStyles({ margin: 'auto', marginTop: '10px' })
        .when((state) => (
          !state[publicIpValidKey] && !state[localIpValidKey] && !state[isUnreachableKey]
        )),
      LastSeenLabel({ minsAgo }),
    ])
    .onCreate(() => {
      testPublicIp();
      testLocalIp();
    });
});
