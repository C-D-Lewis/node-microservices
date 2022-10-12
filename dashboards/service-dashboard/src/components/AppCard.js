/**
 * CardContainer component.
 *
 * @returns {HTMLElement}
 */
const CardContainer = () => fabricate('Card')
  .asFlex('column')
  .setStyles({
    width: '375px',
    margin: '10px 0px 10px 20px',
    opacity: 0,
    visibility: 'hidden',
    transition: '0.6s',
    backgroundColor: Theme.colors.AppCard.titleBar,
    boxShadow: '2px 2px 3px 1px #0004',
  });

/**
 * AppName component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const AppName = () => fabricate('Text')
  .setStyles({
    fontSize: '1.1rem',
    flex: 1,
    color: 'white',
    margin: '6px 5px 5px 5px',
    fontFamily: Theme.fonts.code,
  });

/**
 * StatusText component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
const StatusText = () => fabricate('Text')
  .setStyles({
    color: Theme.colors.AppCard.status,
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
const StatusLED = ({ app }) => fabricate('div')
  .setStyles({
    width: '15px',
    height: '15px',
    borderRadius: '9px',
    marginRight: '5px',
  })
  .onCreate((el, { apps }) => {
    const { status } = apps.find((p) => p.app === app);
    el.setStyles({
      backgroundColor: status.includes('OK') ? Theme.colors.status.ok : Theme.colors.status.down,
    });
  });

/**
 * CardStatus component.
 *
 * @returns {HTMLElement}
 */
const CardStatus = ({ app }) => fabricate('Row')
  .setStyles({
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  })
  .setChildren([
    StatusLED({ app }),
    StatusText()
      .onCreate((el, { apps }) => {
        const { status, port } = apps.find((p) => p.app === app);
        el.setText(`${status} (${port})`);
      }),
  ]);

/**
 * CardTitleRow component.
 *
 * @returns {HTMLElement}
 */
const CardTitleRow = () => fabricate('Row')
  .setStyles({
    alignItems: 'center',
    backgroundColor: Theme.colors.AppCard.titleBar,
    padding: '5px 10px',
  });

/**
 * AppCard component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
fabricate.declare('AppCard', ({ app }) => {
  const container = CardContainer();

  // Become visible shortly after creation
  setTimeout(() => container.setStyles({ opacity: 1, visibility: 'visible' }), 50);

  return container
    .setChildren([
      CardTitleRow()
        .setChildren([
          AppName().setText(app),
          CardStatus({ app }),
        ]),
      fabricate('AppControls', { app }),
    ]);
});
