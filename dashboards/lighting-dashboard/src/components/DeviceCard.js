/* global DeviceControls */

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
  });

/**
 * LED component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device object.
 * @returns {HTMLElement}
 */
const LED = () => fabricate('div')
  .addChildren([
    fabricate('div')
      .withStyles({
        width: '15px',
        height: '15px',
        borderRadius: '9px',
        marginRight: '5px',
      })
      .watchState((el, state) => {
        el.style.backgroundColor = state.connected
          ? Theme.Colors.statusOk
          : Theme.Colors.statusDown;
      }),
  ]);

/**
 * CardStatus component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const CardStatus = () => fabricate.Row()
  .withStyles({
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  })
  .addChildren([
    CardSubtitle({ text: '' }),
    LED(),
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
// eslint-disable-next-line no-unused-vars
const DeviceCard = ({ device }) => fabricate.Fader()
  .addChildren([
    CardContainer()
      .addChildren([
        CardTitleRow()
          .addChildren([
            CardTitle({ text: device.hostname }),
            CardStatus({ device }),
          ]),
        DeviceControls({ device }),
      ]),
  ]);
