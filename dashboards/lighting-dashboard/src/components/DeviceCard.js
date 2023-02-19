/**
 * CardContainer component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const CardContainer = () => fabricate('Column')
  .setStyles({
    width: '375px',
    margin: '20px 0px 10px 0px',
    backgroundColor: Theme.colors.darkGrey,
    borderRadius: '5px',
    overflow: 'hidden',
  });

/**
 * CardTitle component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const CardTitle = () => fabricate('Text')
  .setStyles({
    fontSize: '1.3rem',
    flex: 1,
    color: 'white',
    cursor: 'default',
  });

/**
 * CardSubtitle component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const CardSubtitle = () => fabricate('Text')
  .setStyles({
    color: Theme.colors.lightGrey,
    paddingRight: '5px',
    paddingTop: '2px',
    cursor: 'default',
  });

/**
 * CardStatus component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device object.
 * @returns {HTMLElement} Fabricate component.
 */
const CardStatus = ({ device }) => fabricate('Row')
  .setStyles({
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  })
  .setChildren([
    CardSubtitle().setText(device.localIp || '?'),
    fabricate('LED').onCreate((el) => el.setConnected(true)),
  ]);

/**
 * CardTitleRpw component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const CardTitleRow = () => fabricate('Row')
  .setStyles({
    alignItems: 'center',
    backgroundColor: Theme.colors.veryDarkGrey,
    padding: '10px 15px',
    borderTopLeftRadius: '3px',
    borderTopRightRadius: '3px',
  });

/**
 * DeviceCard component.
 */
fabricate.declare('DeviceCard', ({ device }) => fabricate('Fader')
  .setChildren([
    CardContainer()
      .setChildren([
        CardTitleRow()
          .setChildren([
            CardTitle().setText(device.deviceName),
            CardStatus({ device }),
          ]),
        fabricate('DeviceControls', { device }),
      ]),
  ]));
