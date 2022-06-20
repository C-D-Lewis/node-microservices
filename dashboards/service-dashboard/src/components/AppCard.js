/* global AppControls */

/**
 * CardContainer component.
 *
 * @returns {HTMLElement}
 */
const CardContainer = () => fab.Card()
  .withStyle({
    display: 'flex',
    flexDirection: 'column',
    // width: '375px',
    margin: '10px 0px 10px 20px',
    opacity: 0,
    visibility: 'hidden',
    transition: '0.6s',
  });

/**
 * CardTitle component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const CardTitle = () => fab.Text({ color: 'white' })
  .withStyle({
    fontSize: '1.2rem',
    flex: 1,
    color: 'white',
  });

/**
 * LEDText component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const LEDText = () => fab.Text({ color: Colors.lightGrey })
  .withStyle({
    fontSize: '0.9rem',
    paddingTop: 1,
  });

/**
 * LED component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const LED = () => fab('div')
  .withStyle({
    backgroundColor: Colors.statusDown,
    width: '15px',
    height: '15px',
    borderRadius: '9px',
    marginRight: '5px',
  });

/**
 * CardStatus component.
 *
 * @returns {HTMLElement}
 */
const CardStatus = ({ app }) => {
  const led = LED();
  const ledText = LEDText();

  return fab.Row()
    .withStyle({
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: 2,
    })
    .withChildren([
      led,
      ledText,
    ])
    .watchState((el, { apps }) => {
      const { status, port } = apps.find((p) => p.app === app);
      led.addStyles({ backgroundColor: status.includes('OK') ? Colors.statusOk : Colors.statusDown });
      ledText.setText(`${status} (${port})`);
    }, ['apps']);
};

/**
 * CardTitleRow component.
 *
 * @returns {HTMLElement}
 */
const CardTitleRow = () => fab.Row()
  .withStyle({
    alignItems: 'center',
    backgroundColor: Colors.veryDarkGrey,
    padding: '5px 15px',
  });

/**
 * AppCard component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const AppCard = ({ app }) => {
  const container = CardContainer();

  // Become visible shortly after creation
  setTimeout(() => container.addStyles({ opacity: 1, visibility: 'visible' }), 100);

  return container
    .withChildren([
      CardTitleRow()
        .withChildren([
          CardTitle().setText(app),
          CardStatus({ app }),
        ]),
      AppControls({ app }),
    ]);
};
