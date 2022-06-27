/* global Fonts */

/**
 * ItemName component.
 *
 * @returns {HTMLElement}
 */
const ItemName = () => fab('span')
  .withStyles({
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    padding: '2px 2px 0px 2px',
    cursor: 'default',
  });

/**
 * ItemName component.
 *
 * @returns {HTMLElement}
 */
const ItemIP = () => fab('span')
  .withStyles({
    color: 'lightgrey',
    fontSize: '1rem',
    margin: '0px 12px',
    padding: '3px 0px',
    fontFamily: Fonts.code,
    cursor: 'pointer',
    borderLeft: '2px solid black',
  });

/**
 * ItemContainer component.
 *
 * @returns {HTMLElement}
 */
const ItemContainer = () => fab.Column()
  .withStyles({
    border: '0',
    marginBottom: '5px',
    width: '100%',
  });

/**
 * PublicIpItem component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const IpTextButton = ({ deviceName, ip, type }) => {
  const { key, get: isReachable } = fab.manageState(`FleetItem[${deviceName}]`, `${type}IpValid`, false);
  return ItemIP()
    .setText(`➔${ip}`)
    .watchState((el) => el.addStyles({ color: isReachable() ? 'black' : 'lightgrey' }), [key])
    .onClick(() => fab.updateState('ip', () => ip));
};

/**
 * ItemIcon component.
 *
 * @returns {HTMLElement}
 */
const ItemIcon = () => fab.Image({
  src: 'assets/server-white.png',
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
  const { deviceName, publicIp, localIp } = itemData;
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
    .withStyles({ width: '250px', margin: '10px' })
    .withChildren([
      fab.Row()
        .withStyles({
          backgroundColor: Colors.primary,
          alignItems: 'center',
          borderBottom: '2px solid black',
          height: '40px',
        })
        .withChildren([
          ItemIcon(),
          ItemName().setText(deviceName),
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
