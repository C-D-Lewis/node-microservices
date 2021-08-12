/**
 * CardContainer component.
 *
 * @param {object} props - Component props.
 * @param {Array<HTMLElement>} children - Child components. 
 * @returns {HTMLElement}
 */
const CardContainer = () => fabricate.Column()
  .withStyles({
    width: '375px',
    margin: '20px 0px 10px 0px',
    backgroundColor: Theme.Colors.darkGrey,
    borderRadius: '5px',
    overflow: 'hidden',
  });

/**
 * CardTitle component.
 *
 * @returns {HTMLElement}
 */
const CardTitle = ({ text }) => fabricate.Text({ text })
  .withStyles({
    fontSize: '1.3rem',
    flex: 1,
    color: 'white',
    cursor: 'default',
  });

/**
 * CardSubtitle component.
 *
 * @returns {HTMLElement}
 */
const CardSubtitle = ({ text }) => fabricate.Text({ text })
  .withStyles({
    color: Theme.Colors.lightGrey,
    paddingRight: '10px',
    paddingTop: '2px',
    cursor: 'default',
    color: '#ddd',
  });

/**
 * LED component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device object.
 * @returns {HTMLElement}
 */
const LED = ({ device }) => fabricate('div')
  .addChildren([
    fabricate.when(
      state => state.requestInProgress,
      () => fabricate.Loader({ size: 15, lineWidth: 3 })
        .withStyles({ marginRight: '5px' }),
    ),
    fabricate.when(
      state => !state.requestInProgress,
      () => fabricate('div')
        .withStyles({
          width: '15px',
          height: '15px',
          borderRadius: '9px',
          marginRight: '5px',
          backgroundColor: Theme.Colors.statusDown,
        })
        .watchState((el, state) => {
          const { devices } = state;
          const found = devices.find(p => p.ip === device.ip);

          el.addStyles({
            backgroundColor: found.available ? Theme.Colors.statusOk : Theme.Colors.statusDown,
          });
        }),
    ),
  ]);

/**
 * IpStatus component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device object.
 * @returns {HTMLElement}
 */
const IpStatus = ({ device }) => fabricate.Row()
  .withStyles({
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  })
  .addChildren([
    CardSubtitle({ text: device.ip }),
    LED({ device }),
  ]);

/**
 * CardTitleRpw component.
 *
 * @returns {HTMLElement}
 */
const CardTitleRow = () => fabricate.Row()
  .withStyles({
    alignItems: 'center',
    backgroundColor: Theme.Colors.veryDarkGrey,
    padding: '10px 15px',
    borderTopLeftRadius: '3px',
    borderTopRightRadius: '3px',
  });

/**
 * DeviceCard component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device object.
 * @returns {HTMLElement}
 */
const DeviceCard = ({ device }) => {
  // When the card appears
  pingDevice(device)
    .then(apps => {
      const visuals = apps.find(p => p.app === 'visuals');
      fabricate.updateState('devices', state => {
        const { devices } = state;
        const found = devices.find(p => p.ip === device.ip);
        found.available = visuals && visuals.status === 'OK';

        return devices;
      });
    });

  return fabricate.Fader()
    .addChildren([
      CardContainer()
        .addChildren([
          CardTitleRow()
            .addChildren([
              CardTitle({ text: device.name }),
              IpStatus({ device }),
            ]),
          DeviceControls({ device }),
        ]),
    ]);
};
