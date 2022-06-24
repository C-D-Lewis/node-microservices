/** Height of the bottom status bar */
const HEIGHT = 30;

/**
 * ResponseBar component.
 *
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const ResponseBar = () => fab('div')
  .withStyles({
    fontFamily: 'monospace',
    position: 'relative',
    bottom: 0,
    width: '100%',
    minHeight: HEIGHT,
    padding: '5px',
    backgroundColor: '#333',
    color: 'white',
    alignItems: 'center',
    marginBottom: '10px',
  })
  .watchState((el, { responseBarText }) => el.setText(responseBarText), ['responseBarText']);
