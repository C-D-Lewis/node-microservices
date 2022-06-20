/**
 * ItemName component.
 *
 * @returns {HTMLElement}
 */
const ItemName = () => fab('span')
  .withStyles({
    color: 'black',
    fontWeight: 'bold',
    fontSize: '1rem',
    padding: '2px',
    paddingLeft: '15px',
    backgroundColor: '#eee',
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
    paddingLeft: '15px',
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
const IpItem = ({ deviceName, ip, keyName }) => ItemIP()
  .setText(ip)
  .watchState((el, newState, key) => {
    if (key !== `FleetItem:${deviceName}:${keyName}Valid`) return;

    // Update style
    const reachable = `FleetItem:${deviceName}:${keyName}Valid`;
    el.addStyles({ color: reachable ? 'black' : 'lightgrey' });
  })
  .onClick(() => fab.updateState('ip', () => ip));

/**
 * FleetItem component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const FleetItem = ({ itemData }) => {
  const { deviceName, publicIp, localIp } = itemData;

  const setPublicIpValid = (valid) => fab.updateState(`FleetItem:${deviceName}:publicIpValid`, () => valid);
  const setLocalIpValid = (valid) => fab.updateState(`FleetItem:${deviceName}:localIpValid`, () => valid);

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
      ItemName().setText(deviceName),
      IpItem({
        deviceName,
        ip: publicIp,
        keyName: 'publicIp',
      }),
      IpItem({
        deviceName,
        ip: localIp,
        keyName: 'localIp',
      }),
    ])
    .then(() => {
      testPublicIp();
      testLocalIp();
    });
};
