/**
 * ItemName component.
 *
 * @returns {HTMLElement}
 */
const ItemName = () => fab('span')
  .withStyles({
    color: 'black',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    padding: '2px 2px 0px 5px',
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
    padding: '2px 15px',
    fontFamily: 'monospace',
    cursor: 'pointer',
  });

/**
 * ItemContainer component.
 *
 * @returns {HTMLElement}
 */
const ItemContainer = () => fab.Column()
  .withStyles({
    border: '0',
    margin: '0px 0px 10px 0px',
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
    .setText(ip)
    .watchState((el) => el.addStyles({ color: isReachable() ? 'black' : 'lightgrey' }), [key])
    .onClick(() => fab.updateState('ip', () => ip));
};

/**
 * ItemIcon component.
 *
 * @returns {HTMLElement}
 */
const ItemIcon = () => fab.Image({
  src: 'assets/server.png',
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

  return ItemContainer()
    .withChildren([
      fab.Row()
        .withStyles({ backgroundColor: '#eee', alignItems: 'center' })
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
