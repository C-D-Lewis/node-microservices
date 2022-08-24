/* global AppControls Fonts */

/**
 * CardContainer component.
 *
 * @returns {HTMLElement}
 */
const CardContainer = () => fab.Card()
  .asFlex('column')
  .withStyles({
    width: '375px',
    margin: '10px 0px 10px 20px',
    opacity: 0,
    visibility: 'hidden',
    transition: '0.6s',
    backgroundColor: Colors.AppCardTitle,
    boxShadow: '2px 2px 3px 1px #0004',
  });

/**
 * AppName component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const AppName = () => fab.Text()
  .withStyles({
    fontSize: '1.1rem',
    flex: 1,
    color: 'white',
    margin: '6px 5px 5px 5px',
    fontFamily: Fonts.code,
  });

/**
 * StatusText component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const StatusText = () => fab.Text()
  .withStyles({
    color: Colors.AppCard.status,
    fontSize: '0.9rem',
    paddingTop: 1,
    marginBottom: '2px',
  });

/**
 * StatusLED component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const StatusLED = ({ status }) => fab('div')
  .withStyles({
    backgroundColor: status.includes('OK') ? Colors.status.ok : Colors.status.down,
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
  const apps = fab.getState('apps');
  const { status, port } = apps.find((p) => p.app === app);

  return fab.Row()
    .withStyles({
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: 2,
    })
    .withChildren([
      StatusLED({ status }),
      StatusText().setText(`${status} (${port})`),
    ]);
};

/**
 * CardTitleRow component.
 *
 * @returns {HTMLElement}
 */
const CardTitleRow = () => fab.Row()
  .withStyles({
    alignItems: 'center',
    backgroundColor: Colors.AppCard.titleBar,
    padding: '5px 10px',
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
  setTimeout(() => container.addStyles({ opacity: 1, visibility: 'visible' }), 50);

  return container
    .withChildren([
      CardTitleRow()
        .withChildren([
          AppName().setText(app),
          CardStatus({ app }),
        ]),
      AppControls({ app }),
    ]);
};
