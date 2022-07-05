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
      padding: '8px 5px',
      fontFamily: Fonts.code,
      cursor: 'pointer',
      borderLeft: '2px solid black',
    })
    .setText(ip)
    .watchState((el) => el.addStyles({ color: isReachable() ? 'black' : 'lightgrey' }), [key])
    .onClick(() => {
      // Select device, go to apps page
      fab.updateState('ip', () => ip);
      fab.updateState('page', () => 'appsPage');
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
 * FleetItem component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const FleetItem = ({ itemData }) => {
  const {
    deviceName, publicIp, localIp, deviceType = 'other',
  } = itemData;
  const { set: setPublicIpValid } = fab.manageState(`FleetItem[${deviceName}]`, 'publicIpValid', false);
  const { set: setLocalIpValid } = fab.manageState(`FleetItem[${deviceName}]`, 'localIpValid', false);

  /**
   * Test publicIp is reachable.
   */
  const testPublicIp = async () => {
    try {
      await fetch(`http://${publicIp}:5959/apps`);
      setPublicIpValid(true);
    } catch (err) { /* It isn't available */ }
  };

  /**
   * Test localIp is reachable.
   */
  const testLocalIp = async () => {
    try {
      await fetch(`http://${localIp}:5959/apps`);
      setLocalIpValid(true);
    } catch (err) { /* It isn't available */ }
  };

  return fab.Card()
    .withStyles({ minWidth: '250px', margin: '10px' })
    .withChildren([
      fab.Row()
        .withStyles({
          backgroundColor: Colors.veryDarkGrey,
          alignItems: 'center',
          borderBottom: '2px solid black',
          height: '30px',
        })
        .withChildren([
          DeviceIcon({ deviceType }),
          DeviceName().setText(deviceName),
        ]),
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
    ])
    .then(() => {
      testPublicIp();
      testLocalIp();
    });
};
