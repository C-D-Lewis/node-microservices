/**
 * GroupLabel component.
 *
 * @param {object} props - Component props.
 * @param {string} props.publicIp - Public IP.
 * @returns {HTMLElement} GroupLabel component.
 */
const GroupLabel = ({ publicIp }) => fabricate('Row')
  .setStyles({
    width: '100%',
    borderRadius: '10px 10px 0px 0px',
    marginBottom: '10px',
    backgroundColor: '#0004',
    padding: '10px',
    alignItems: 'center',
    justifyContent: 'center',
  })
  .setChildren([
    fabricate('Image', { src: 'assets/network.png' })
      .setStyles({
        width: '20px',
        height: '20px',
        marginRight: '5px',
      }),
    fabricate('div')
      .setStyles({
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        cursor: 'default',
      })
      .setText(publicIp),
  ]);

/**
 * FleetPage component, column of public IPs with devices inside them.
 */
fabricate.declare('FleetPage', () => fabricate('Column')
  .onUpdate((el, { fleetList }) => {
    const buckets = {};

    // Sort fleet into publicIp buckets
    fleetList.forEach((device) => {
      const { publicIp } = device;
      if (!buckets[publicIp]) {
        buckets[publicIp] = [];
      }

      buckets[publicIp].push(device);
    });

    // Group area for each bucket
    el.setChildren(Object.entries(buckets).map(([publicIp, devices]) => (
      fabricate('Row')
        .setStyles({
          flexWrap: 'wrap',
          paddingBottom: '10px',
          backgroundColor: '#0004',
          borderRadius: '10px',
          margin: '15px',
          boxShadow: '2px 2px 3px 1px #0004',
        })
        .setChildren([
          GroupLabel({ publicIp }),
          ...devices.map((device) => fabricate('DeviceCard', { device })),
        ])
    )));
  }, ['fleetList']));
