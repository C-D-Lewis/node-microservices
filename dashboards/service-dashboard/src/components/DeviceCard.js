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
    })
    .setText(deviceIp)
    .onUpdate((el, state) => {
      const isReachable = state[isReachableKey];

      // TODO: watchlist of [key] here breaks this for some reason
      el.setStyles({
        color: isReachable
          ? Theme.colors.IpTextButton.reachable
          : Theme.colors.IpTextButton.unreachable,
        cursor: isReachable ? 'pointer' : 'default',
      });
    })
    .onClick((el, state) => {
      if (!state[isReachableKey]) return;

      // Select device, go to apps page
      fabricate.update({
        selectedIp: deviceIp,
        page: 'AppsPage',
        selectedDeviceName: deviceName,
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
 * @param {number} props.lastCheckIn - Last seem minutes ago.
 * @returns {HTMLElement} Fabricate component.
 */
const LastSeenLabel = ({ lastCheckIn }) => fabricate('Text')
  .setStyles({
    color: Theme.colors.AppCard.lastSeen,
    fontStyle: 'italic',
    fontSize: '0.9rem',
    textAlign: 'end',
    margin: '8px',
    paddingTop: '10px',
    marginTop: 'auto',
  })
  .setText(Utils.getTimeAgoStr(lastCheckIn));

/**
 * CardTitle component.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.seenRecently - If the device is recently updated and presumed to be alive.
 * @returns {HTMLElement} Fabricate component.
 */
const CardTitle = ({ seenRecently }) => fabricate('Row')
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
    minWidth: '300px',
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
const CommitView = ({ commit, commitDate }) => fabricate('Row')
  .setStyles({ alignItems: 'center' })
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
      .setText(commit ? `${commit} (${Utils.getTimeAgoStr(new Date(commitDate).getTime())})` : 'Unknown'),
  ]);

/**
 * DeviceCard component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement} Fabricate component.
 */
fabricate.declare('DeviceCard', ({ device }) => {
  const {
    deviceName, publicIp, localIp, deviceType = 'other', lastCheckIn, commit, commitDate,
  } = device;
  const publicIpValidKey = Utils.isReachableKey(deviceName, 'public');
  const localIpValidKey = Utils.isReachableKey(deviceName, 'local');

  const minsAgo = Math.round((Date.now() - lastCheckIn) / (1000 * 60));
  const seenRecently = minsAgo < 12;  // Based on default checkin interval of 10m

  /**
   * Test IP is reachable.
   *
   * @param {string} ip - IP to use.
   * @param {string} stateKey - State to update.
   */
  const testIp = async (ip, stateKey) => {
    try {
      await fetch(`http://${ip}:5959/ping`);
      fabricate.update(stateKey, true);
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
      CommitView({ commit, commitDate }),
    ])
    .onCreate(() => {
      testIp(publicIp, publicIpValidKey);
      testIp(localIp, localIpValidKey);
    });
});
